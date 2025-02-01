package tracker

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/stretchr/testify/assert"
)

// `GET /v0/dataset/{digest}/mirrors` should return an empty array (not nil) if
// there are no mirrors for a given `digest`.
func TestGetDatasetMirrorsHandlerNoMirror(t *testing.T) {
	// Arrange
	digest := "ypw5mjhdg3qb2ia4xnuzbiywemsctda5rg3gsbpyvr7hy34nxemq"
	s := miniredis.RunT(t)
	mockMirrorDB := MustOpenMirrorDB(s.Addr(), "")
	req := httptest.NewRequest("POST", fmt.Sprintf("http://example.org/v0/datasets/%s/mirrors", digest), nil)
	req.SetPathValue("digest", digest)
	res := httptest.NewRecorder()

	// Act
	handler := GetDatasetMirrorsHandler{MirrorDB: mockMirrorDB}
	handler.ServeHTTP(res, req)

	// Assert
	assert.Equal(t, `{"data":[],"object":"list"}`+"\n", res.Body.String())
}

// `GET /v0/dataset/{digest}/mirrors` should return an array of mirror URLs, if
// exist, for a given `digest`.
func TestGetDatasetMirrorsHandlerMirrors(t *testing.T) {
	// Arrange
	digest := "ypw5mjhdg3qb2ia4xnuzbiywemsctda5rg3gsbpyvr7hy34nxemq"
	s := miniredis.RunT(t)
	s.ZAdd(digest, 0, "http://example.net/")
	mockMirrorDB := MustOpenMirrorDB(s.Addr(), "")
	req := httptest.NewRequest("POST", fmt.Sprintf("http://example.org/v0/datasets/%s/mirrors", digest), nil)
	req.SetPathValue("digest", digest)
	res := httptest.NewRecorder()

	// Act
	handler := GetDatasetMirrorsHandler{MirrorDB: mockMirrorDB}
	handler.ServeHTTP(res, req)

	// Assert
	assert.Equal(t, `{"data":[{"object":"mirror","url":"http://example.net/"}],"object":"list"}`+"\n", res.Body.String())
}

// `GET /v0/dataset/{digest}/mirrors` should set the correct headers on its
// responses.
func TestGetDatasetMirrorsHandlerHeaders(t *testing.T) {
	// Arrange
	s := miniredis.RunT(t)
	mockMirrorDB := MustOpenMirrorDB(s.Addr(), "")
	digest := "ypw5mjhdg3qb2ia4xnuzbiywemsctda5rg3gsbpyvr7hy34nxemq"
	req := httptest.NewRequest("POST", fmt.Sprintf("http://example.org/v0/datasets/%s/mirrors", digest), nil)
	req.SetPathValue("digest", digest)
	res := httptest.NewRecorder()

	// Act
	handler := GetDatasetMirrorsHandler{MirrorDB: mockMirrorDB}
	handler.ServeHTTP(res, req)

	// Assert
	assert.Equal(
		t,
		http.Header{
			"Access-Control-Allow-Origin": {"*"},
			"Content-Type":                {"application/json"},
		},
		res.Header(),
	)
}
