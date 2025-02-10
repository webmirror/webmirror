package tracker

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/stretchr/testify/require"
)

// `GET /v0/dataset/{digest}/mirrors` should return an empty array (not nil) if
// there are no mirrors for a given `digest`.
func TestGetDatasetMirrorsHandlerNoMirror(t *testing.T) {
	// Arrange
	redisSrv := miniredis.RunT(t)
	apiSrv := httptest.NewServer(MakeHandler(redisSrv.Addr(), "", true))
	digest := "abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrst"

	// Act
	res, err := http.Get(
		fmt.Sprintf("%s/v0/datasets/%s/mirrors", apiSrv.URL, digest),
	)
	body, _ := io.ReadAll(res.Body)

	// Assert
	require.Nil(t, err)
	require.Equal(t, 200, res.StatusCode)
	require.Equal(t, "application/json", res.Header.Get("Content-Type"))
	require.Equal(t, `{"data":[],"object":"list"}`+"\n", string(body))
}

// `GET /v0/dataset/{digest}/mirrors` should return an array of mirror URLs, if
// exist, for a given `digest`.
func TestGetDatasetMirrorsHandlerMirrors(t *testing.T) {
	// Arrange
	redisSrv := miniredis.RunT(t)
	apiSrv := httptest.NewServer(MakeHandler(redisSrv.Addr(), "", true))
	digest := "abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrst"
	redisSrv.ZAdd(digest, 0, "http://example.net/")

	// Act
	res, err := http.Get(
		fmt.Sprintf("%s/v0/datasets/%s/mirrors", apiSrv.URL, digest),
	)
	body, _ := io.ReadAll(res.Body)

	// Assert
	require.Nil(t, err)
	require.Equal(t, 200, res.StatusCode)
	require.Equal(t, "application/json", res.Header.Get("Content-Type"))
	require.Equal(
		t,
		`{"data":[{"object":"mirror","url":"http://example.net/"}],"object":"list"}`+"\n",
		string(body),
	)
}

// `GET /v0/dataset/{digest}/mirrors` should set the correct headers on its
// responses.
func TestGetDatasetMirrorsHandlerHeaders(t *testing.T) {
	// Arrange
	redisSrv := miniredis.RunT(t)
	apiSrv := httptest.NewServer(MakeHandler(redisSrv.Addr(), "", true))
	digest := "abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrst"

	// Act
	res, err := http.Get(
		fmt.Sprintf("%s/v0/datasets/%s/mirrors", apiSrv.URL, digest),
	)

	// Assert
	require.Nil(t, err)
	require.Equal(t, 200, res.StatusCode)
	require.Equal(t, []string{"*"}, res.Header["Access-Control-Allow-Origin"])
}

// `GET /v0/dataset/{digest}/mirrors` should return an HTTP 400 response if
// the digest in the URL is malformed.
func TestGetDatasetMirrorsHandlerMalformedDigest(t *testing.T) {
	// Arrange
	redisSrv := miniredis.RunT(t)
	apiSrv := httptest.NewServer(MakeHandler(redisSrv.Addr(), "", true))
	// Although the digest has the correct length (52 chars), it should be
	// rejected due to uppercase characters.
	digest := "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRST"

	// Act
	res, err := http.Get(
		fmt.Sprintf("%s/v0/datasets/%s/mirrors", apiSrv.URL, digest),
	)
	body, _ := io.ReadAll(res.Body)

	// Assert
	require.Nil(t, err)
	require.Equal(t, 400, res.StatusCode)
	require.Equal(
		t,
		"text/plain; charset=utf-8",
		res.Header.Get("Content-Type"),
	)
	require.Equal(
		t,
		"400 Bad Request: malformed digest in the request path",
		string(body),
	)
}

// `GET /v0/dataset/{digest}/mirrors` should return an HTTP 500 response if
// there is a Redis error.
func TestGetDatasetMirrorsHandlerRedisError(t *testing.T) {
	// Arrange
	redisSrv := miniredis.RunT(t)
	apiSrv := httptest.NewServer(MakeHandler(redisSrv.Addr(), "", true))
	redisSrv.SetError(
		"MASTERDOWN Link with MASTER is down and replica-serve-stale-data is set to 'no'.",
	)
	digest := "abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrst"

	// Act
	res, err := http.Get(
		fmt.Sprintf("%s/v0/datasets/%s/mirrors", apiSrv.URL, digest),
	)
	body, _ := io.ReadAll(res.Body)

	// Assert
	require.Nil(t, err)
	require.Equal(t, 500, res.StatusCode)
	require.Equal(
		t,
		"text/plain; charset=utf-8",
		res.Header.Get("Content-Type"),
	)
	require.Equal(t, "500 Internal Server Error", string(body))
}

// `POST /v0/dataset/{digest}/mirrors` should return an HTTP 202 response if the
// request is accepted.
func TestPostDatasetMirrorsHandlerAccepted(t *testing.T) {
	// Arrange
	digest := "abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrst"
	redisSrv := miniredis.RunT(t)
	apiSrv := httptest.NewServer(MakeHandler(redisSrv.Addr(), "", true))

	// Act
	res, err := http.Post(
		fmt.Sprintf("%s/v0/datasets/%s/mirrors", apiSrv.URL, digest),
		"application/json",
		strings.NewReader(`{ "url": "http://example.net/" }`),
	)
	body, _ := io.ReadAll(res.Body)

	// Assert
	require.Nil(t, err)
	require.Equal(t, 202, res.StatusCode)
	require.Equal(
		t,
		"text/plain; charset=utf-8",
		res.Header.Get("Content-Type"),
	)
	require.Equal(t, "202 Accepted", string(body))
}

// `POST /v0/dataset/{digest}/mirrors` should return an HTTP 400 response if the
// digest in the URL is malformed.
func TestPostDatasetMirrorsHandlerMalformedDigest(t *testing.T) {
	// Arrange
	redisSrv := miniredis.RunT(t)
	apiSrv := httptest.NewServer(MakeHandler(redisSrv.Addr(), "", true))
	// Characters '0', '1', '8', and '9' are not present in the standard base32
	// encoding alphabet, so although string has the correct length (52 chars),
	// it should be rejected due to invalid characters.
	digest := "0189018901890189018901890189018901890189018901890189"

	// Act
	res, err := http.Post(
		fmt.Sprintf("%s/v0/datasets/%s/mirrors", apiSrv.URL, digest),
		"application/json",
		strings.NewReader(`{ "url": "http://example.net/" }`),
	)
	body, _ := io.ReadAll(res.Body)

	// Assert
	require.Nil(t, err)
	require.Equal(t, 400, res.StatusCode)
	require.Equal(
		t,
		"text/plain; charset=utf-8",
		res.Header.Get("Content-Type"),
	)
	require.Equal(
		t,
		"400 Bad Request: malformed digest in the request path",
		string(body),
	)
}
