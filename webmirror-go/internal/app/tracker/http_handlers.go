package tracker

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type user struct {
	id         int
	defaultTTL int
}

type Handler struct {
	DB *Database
}

type GetServersHandler struct {
	Handler
}

func (h GetServersHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	digest := r.URL.Query().Get("digest")

	if digest == "" {
		writeResponse(w, http.StatusBadRequest, "`digest` query parameter is missing")
		log.Println("`digest` query parameter missing")
		return
	}

	rows, err := h.DB.sqlDB.QueryContext(
		r.Context(),
		"SELECT url FROM server WHERE digest = ? AND expires_at > ? LIMIT 100",
		digest, time.Now().Unix(),
	)
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "")
		log.Printf("%+v\n", err)
		return
	}
	defer rows.Close()

	urls := make([]string, 0)
	for rows.Next() {
		var url string
		if err := rows.Scan(&url); err != nil {
			writeResponse(w, http.StatusInternalServerError, "")
			log.Printf("%+v\n", err)
			return
		}
		urls = append(urls, url)
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	err = encoder.Encode(urls)
	if err != nil {
		log.Printf("%+v\n", err)
	}
}

type PostServersHandler struct {
	Handler
}

func (h PostServersHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, err := h.authorize(r)
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "")
		log.Printf("%+v\n", err)
		return
	}
	if user == nil {
		w.Header().Set("WWW-Authenticate", "Bearer")
		writeResponse(w, http.StatusUnauthorized, "contact @boramalper for help")
		return
	}

	var reqBody map[string]interface{}
	err = json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "")
		log.Printf("%+v\n", err)
		return
	}

	url, err := url.ParseRequestURI(reqBody["url"].(string))
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "")
		log.Printf("%+v\n", err)
		return
	}

	host := fmt.Sprintf("%s://%s", url.Scheme, url.Host)
	expires_at := time.Now().Add(time.Duration(user.defaultTTL) * time.Second).Unix()

	_, err = h.DB.sqlDB.ExecContext(
		r.Context(),
		"INSERT INTO server (digest, host, path, user, expires_at) VALUES (?, ?, ?, ?, ?)",
		reqBody["digest"].(string), host, url.Path, user.id, expires_at,
	)
	if err != nil {
		writeResponse(w, http.StatusInternalServerError, "")
		log.Printf("%+v\n", err)
		return
	}

	writeResponse(w, http.StatusOK, "")
}

func (h Handler) authorize(r *http.Request) (*user, error) {
	auth := r.Header.Get("Authorization")
	token := strings.TrimSpace(strings.Replace(auth, "Bearer", "", 1))

	var (
		id         int
		defaultTTL int
	)
	err := h.DB.sqlDB.QueryRowContext(
		r.Context(),
		"SELECT id, default_ttl FROM user WHERE token = ?",
		token,
	).Scan(&id, &defaultTTL)
	if err != nil {
		return nil, err
	}

	return &user{id: id, defaultTTL: defaultTTL}, nil
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
