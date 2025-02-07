package tracker

import (
	"context"
	"crypto/sha256"
	"encoding/base32"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
)

const TaskTypeValidate = "validate"

type ValidateTaskPayload struct {
	Digest      string
	URL         string
	SubmittedBy string
}

// Like the standard base32 encoding, as defined in RFC 4648, but without
// padding and in lowercase.
var stdBase32NoPadLC = base32.NewEncoding("abcdefghijklmnopqrstuvwxyz234567").WithPadding(base32.NoPadding)

func NewValidateTask(digest, url, submittedBy string) (*asynq.Task, string) {
	payload, err := json.Marshal(ValidateTaskPayload{
		Digest:      digest,
		URL:         url,
		SubmittedBy: submittedBy,
	})
	if err != nil {
		panic(err)
	}

	taskDigest := sha256.Sum256([]byte(digest + url))
	taskID := stdBase32NoPadLC.EncodeToString(taskDigest[:])

	return asynq.NewTask(TaskTypeValidate, payload), taskID
}

var httpClient = http.Client{
	Timeout: 5 * time.Second,
	CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
		return errors.New("redirects are not allowed")
	},
}

// 2 MiB = 2.097152 MB
const maxDigestSize = 2 * 1024 * 1024

type ValidateTaskHandler struct {
	MirrorDB *redis.Client
}

// If `ProcessTask` returns
//   - `SkipRetry` error, the task will be archived regardless of the number of
//     remaining retry count;
//   - Otherwise a non-nil error or panics, the task will be retried again
//     later.
func (h ValidateTaskHandler) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload ValidateTaskPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		// JSON parsing failures are not something you can retry on; skip
		// retrying and archive the task right away instead.
		return asynq.SkipRetry
	}

	err := h.MirrorDB.ZScore(ctx, payload.Digest, payload.URL).Err()
	if err == nil {
		// err being nil indicates that the (digest, URL) pair is successfully
		// found in the database. No need to validate, stop processing.
		return nil
	} else if err != redis.Nil {
		// `redis.Nil` is better thought as `redis.NotFoundError`. If the
		// (digest, URL) pair is not found in the database, we must continue the
		// validation. Any error other than `redis.Nil` (i.e. "not found") is a
		// system error so skip retrying and archive the task right away
		// instead.
		return asynq.SkipRetry
	}

	url, err := getDirDescURL(payload.URL)
	if err != nil {
		// Failure to get the directory description's URL is a system error so
		// skip retrying and archive the task right away instead.
		return asynq.SkipRetry
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		// Failure to create an HTTP request (without even making the request)
		// is a system error so skip retrying and archive the task right away
		// instead.
		return asynq.SkipRetry
	}

	res, err := httpClient.Do(req)
	if err != nil {
		// Do not retry on remote-peer errors, just stop processing.
		return nil
	}

	if res.StatusCode != http.StatusOK {
		// Do not retry on remote-peer errors, just stop processing.
		return nil
	}

	hash := sha256.New()
	_, err = io.CopyN(hash, res.Body, maxDigestSize)
	if err != nil && err != io.EOF {
		// Do not retry on remote-peer errors, just stop processing.
		return nil
	}

	actualDigest := stdBase32NoPadLC.EncodeToString(hash.Sum(nil))
	if payload.Digest != actualDigest {
		// Do not retry on remote-peer errors, just stop processing.
		return nil
	}

	h.MirrorDB.ZAdd(
		ctx,
		payload.Digest,
		redis.Z{Member: payload.URL, Score: float64(time.Now().Unix())},
	)

	return nil
}

func getDirDescURL(mirror string) (string, error) {
	rel, err := url.Parse(".webmirror/directory-description.json")
	if err != nil {
		return "", err
	}

	mirrorURL, err := url.Parse(mirror)
	if err != nil {
		return "", err
	}

	return mirrorURL.ResolveReference(rel).String(), nil
}
