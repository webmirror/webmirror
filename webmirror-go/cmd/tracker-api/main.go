package main

import (
	"log"
	"net/http"

	"github.com/alecthomas/kong"
	"github.com/hibiken/asynq"

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

	limitDB := tracker.MustOpenLimitDB(cli.DatabaseAddr, cli.DatabasePass)
	defer limitDB.Close()
	mirrorDB := tracker.MustOpenMirrorDB(cli.DatabaseAddr, cli.DatabasePass)
	defer mirrorDB.Close()
	queue := asynq.NewClient(asynq.RedisClientOpt{
		Addr:     cli.DatabaseAddr,
		Password: cli.DatabasePass,
		DB:       tracker.QueueID,
	})
	defer queue.Close()

	http.Handle(
		"GET /v0/datasets/{digest}/mirrors",
		tracker.GetDatasetMirrorsHandler{MirrorDB: mirrorDB},
	)
	http.Handle(
		"POST /v0/datasets/{digest}/mirrors",
		tracker.PostDatasetMirrorsHandler{LimitDB: limitDB, Queue: queue},
	)

	log.Fatal(http.ListenAndServe(cli.Addr, nil))
}
