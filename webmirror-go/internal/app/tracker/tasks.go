package tracker

import (
	"context"
	"crypto/sha256"
	"encoding/base32"
	"encoding/json"
	"errors"
	"io"
	"log"
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
}

// 2 MiB = 2.097152 MB
const maxDigestSize = 2 * 1024 * 1024

type ValidateTaskHandler struct {
	MirrorDB *redis.Client
}

func (h ValidateTaskHandler) ProcessTask(ctx context.Context, task *asynq.Task) error {
	var payload ValidateTaskPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		log.Printf("error: %+v\n", err)
		return err
	}

	log.Println("processing", payload)

	err := h.MirrorDB.ZScore(ctx, payload.Digest, payload.URL).Err()
	log.Println("ZSCORE", err)
	if err == nil {
		// error being nil indicates that the (digest, URL) pair is successfully
		// found in the database. No need to validate, skip.
		log.Println("already in the database, skipping")
		return nil
	} else if err != redis.Nil {
		// `redis.Nil` is better thought as `redis.NotFoundError`. If the
		// (digest, URL) par is not found in the database, we must validate. Any
		// error other than "not found" is a failure.
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, getDirDescURL(payload.URL), nil)
	if err != nil {
		log.Printf("error: %+v\n", err)
		return err
	}

	res, err := httpClient.Do(req)
	if err != nil {
		log.Printf("error: %+v\n", err)
		return err
	}

	if res.StatusCode != http.StatusOK {
		log.Printf("error: non-200 status: %d\n", res.StatusCode)
		return errors.New("non-200 status")
	}

	hash := sha256.New()
	_, err = io.CopyN(hash, res.Body, maxDigestSize)
	if err != nil && err != io.EOF {
		log.Printf("error: %+v\n", err)
		return err
	}

	actualDigest := stdBase32NoPadLC.EncodeToString(hash.Sum(nil))
	if payload.Digest != actualDigest {
		// wrong mirror
		// TODO: record this in the rate limiter
		log.Println("error: digest mismatch")
		log.Println("expected", payload.Digest)
		log.Println("actual", actualDigest)
		return nil
	}

	log.Printf("ALL GOOD YAY!")
	h.MirrorDB.ZAdd(ctx, payload.Digest, redis.Z{Member: payload.URL, Score: float64(time.Now().Unix())})
	return nil
}

func getDirDescURL(mirror string) string {
	rel, err := url.Parse(".webmirror/directory-description.json")
	if err != nil {
		panic(err)
	}

	mirrorURL, err := url.Parse(mirror)
	if err != nil {
		panic(err)
	}

	return mirrorURL.ResolveReference(rel).String()
}
