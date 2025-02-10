package tracker

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/netip"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
	"github.com/valkey-io/valkey-go/valkeylimiter"
)

var digestRegex = regexp.MustCompile("^[a-z2-7]{52}$")

type GetDatasetMirrorsHandler struct {
	MirrorDB *redis.Client
}

func (h GetDatasetMirrorsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	digest := r.PathValue("digest")
	if !digestRegex.MatchString(digest) {
		writeResponse(w, http.StatusBadRequest, "malformed digest in the request path")
		return
	}

	mirrors, err := h.MirrorDB.ZRandMember(r.Context(), digest, 10).Result()
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "")
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	data := make([]map[string]interface{}, 0)
	for _, mirror := range mirrors {
		data = append(data, map[string]interface{}{
			"object": "mirror",
			"url":    mirror,
		})
	}

	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	err = encoder.Encode(map[string]interface{}{
		"object": "list",
		"data":   data,
	})
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "")
	}
}

type PostDatasetMirrorsHandler struct {
	Queue   *asynq.Client
	Limiter valkeylimiter.RateLimiterClient
}

type PostDatasetMirrorsRequestBody struct {
	URL string `json:"url"`
}

func (h PostDatasetMirrorsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	remote := canonicalIP(r.RemoteAddr)

	res, err := h.Limiter.Allow(r.Context(), remote)
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "invalid `url` in the request body")
		return
	}

	if !res.Allowed {
		w.Header().Add("Retry-After", time.UnixMilli(res.ResetAtMs).Format(http.TimeFormat))
		writeResponse(w, http.StatusTooManyRequests, "")
		return
	}

	digest := r.PathValue("digest")
	if !digestRegex.MatchString(digest) {
		writeResponse(w, http.StatusBadRequest, "malformed digest in the request path")
		return
	}

	var body PostDatasetMirrorsRequestBody
	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		writeResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	url, err := url.ParseRequestURI(body.URL)
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "invalid `url` in the request body")
		return
	}

	if !strings.HasSuffix(url.Path, "/") {
		writeResponse(w, http.StatusBadRequest, "`url` does not end with a trailing slash")
	}

	task, taskID := NewValidateTask(digest, url.String(), remote)
	h.Queue.EnqueueContext(r.Context(), task, asynq.TaskID(taskID))

	writeResponse(w, http.StatusAccepted, "")
}

func MakeHandler(
	databaseAddr, databasePass string, disableCache bool,
) *http.ServeMux {
	mirrorDB := MustOpenMirrorDB(databaseAddr, databasePass)
	queue := MustOpenQueue(databaseAddr, databasePass)
	limiter := MustOpenLimiter(databaseAddr, databasePass, disableCache)

	mux := http.NewServeMux()
	mux.Handle(
		"GET /v0/datasets/{digest}/mirrors",
		GetDatasetMirrorsHandler{MirrorDB: mirrorDB},
	)
	mux.Handle(
		"POST /v0/datasets/{digest}/mirrors",
		PostDatasetMirrorsHandler{Limiter: limiter, Queue: queue},
	)

	return mux
}

func writeResponse(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Add("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(statusCode)
	statusText := http.StatusText(statusCode)
	if message != "" {
		fmt.Fprintf(w, "%d %s: %s", statusCode, statusText, message)
	} else {
		fmt.Fprintf(w, "%d %s", statusCode, statusText)
	}
}

func canonicalIP(addrPort string) string {
	addr := netip.MustParseAddrPort(addrPort).Addr()

	if addr.Is4() {
		return addr.String()
	} else {
		prefix, err := addr.Prefix(64)
		if err != nil {
			panic(err)
		}
		return prefix.Addr().String()
	}
}
