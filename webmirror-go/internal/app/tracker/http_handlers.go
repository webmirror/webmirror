package tracker

import (
	"encoding/json"
	"net/http"
)

type DescriptionServersHandler struct {
	// a map of digests -> [server URLs]
	DigestServerMap map[string][]string
}

func (h DescriptionServersHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	dirDigest := r.PathValue("digest")

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.Encode(h.DigestServerMap[dirDigest])
}
