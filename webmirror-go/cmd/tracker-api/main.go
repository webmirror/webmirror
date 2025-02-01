package main

import (
	"log"
	"net/http"
	"time"

	"github.com/alecthomas/kong"
	"github.com/hibiken/asynq"
	"github.com/valkey-io/valkey-go"
	"github.com/valkey-io/valkey-go/valkeylimiter"

	"github.com/webmirror/webmirror/webmirror-go/internal/app/tracker"
)

var cli struct {
	DatabaseAddr string `help:"Address of the database host." default:"localhost:6379"`
	DatabasePass string `help:"Password for the database." default:""`
	Addr         string `help:"Address to listen." default:":2020"`
}

func main() {
	ctx := kong.Parse(&cli)
	err := ctx.Error
	if err != nil {
		panic(err)
	}

	mirrorDB := tracker.MustOpenMirrorDB(cli.DatabaseAddr, cli.DatabasePass)
	defer mirrorDB.Close()
	queue := asynq.NewClient(asynq.RedisClientOpt{
		Addr:     cli.DatabaseAddr,
		Password: cli.DatabasePass,
		DB:       tracker.QueueID,
	})
	defer queue.Close()
	limiter, err := valkeylimiter.NewRateLimiter(valkeylimiter.RateLimiterOption{
		ClientOption: valkey.ClientOption{
			InitAddress: []string{cli.DatabaseAddr},
			Password:    cli.DatabasePass,
			SelectDB:    tracker.LimitID,
		},
		KeyPrefix: "requests",
		Limit:     3,
		Window:    time.Minute,
	})
	if err != nil {
		panic(err)
	}

	http.Handle(
		"GET /v0/datasets/{digest}/mirrors",
		tracker.GetDatasetMirrorsHandler{MirrorDB: mirrorDB},
	)
	http.Handle(
		"POST /v0/datasets/{digest}/mirrors",
		tracker.PostDatasetMirrorsHandler{Limiter: limiter, Queue: queue},
	)

	log.Fatal(http.ListenAndServe(cli.Addr, nil))
}
