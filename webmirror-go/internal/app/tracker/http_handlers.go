package tracker

import (
	"encoding/json"
	"fmt"
	"log"
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

var digestRegex = regexp.MustCompile("^[a-z0-9]{52}$")

type GetDatasetMirrorsHandler struct {
	MirrorDB *redis.Client
}

func (h GetDatasetMirrorsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	digest := r.PathValue("digest")
	if !digestRegex.MatchString(digest) {
		writeResponse(w, http.StatusBadRequest, "invalid digest in the request path")
		return
	}

	mirrors, err := h.MirrorDB.ZRandMember(r.Context(), digest, 10).Result()
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "")
		log.Printf("%+v\n", err)
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
		log.Printf("%+v\n", err)
	}
}

type PostDatasetMirrorsHandler struct {
	Queue   *asynq.Client
	Limiter valkeylimiter.RateLimiterClient
	LimitDB *redis.Client
}

type PostDatasetMirrorsRequestBody struct {
	URL string `json:"url"`
}

func (h PostDatasetMirrorsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	remote := canonicalIP(r.RemoteAddr)

	res, err := h.Limiter.Allow(r.Context(), remote)
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "invalid `url` in the request body")
		log.Printf("%+v\n", err)
		return
	}

	log.Printf("RATE-LIMITING: %s %+v\n", remote, res)

	if !res.Allowed {
		w.Header().Add("Retry-After", time.UnixMilli(res.ResetAtMs).Format(http.TimeFormat))
		writeResponse(w, http.StatusTooManyRequests, "")
		return
	}

	digest := r.PathValue("digest")
	if !digestRegex.MatchString(digest) {
		writeResponse(w, http.StatusBadRequest, "invalid digest in the request path")
		return
	}

	var body PostDatasetMirrorsRequestBody
	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		writeResponse(w, http.StatusBadRequest, "invalid request body")
		log.Printf("%+v\n", err)
		return
	}

	url, err := url.ParseRequestURI(body.URL)
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "invalid `url` in the request body")
		log.Printf("%+v\n", err)
		return
	}

	if !strings.HasSuffix(url.Path, "/") {
		writeResponse(w, http.StatusBadRequest, "`url` does not end with a trailing slash")
	}

	task, taskID := NewValidateTask(digest, url.String(), r.RemoteAddr)
	h.Queue.EnqueueContext(r.Context(), task, asynq.TaskID(taskID))

	writeResponse(w, http.StatusAccepted, "")
}

func writeResponse(w http.ResponseWriter, statusCode int, message string) {
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
