package main

import (
	"log"

	"github.com/alecthomas/kong"
	"github.com/hibiken/asynq"

	"github.com/webmirror/webmirror/webmirror-go/internal/app/tracker"
)

var cli struct {
	DatabaseAddr string `help:"Address of the database host." default:"localhost:6379"`
	DatabasePass string `help:"Password for the database." default:""`
	Concurrency  int    `help:"Maximum number of concurrent validations. Non-positive values set to the number of CPUs." default:"0"`
}

func main() {
	ctx := kong.Parse(&cli)
	err := ctx.Error
	if err != nil {
		panic(err)
	}

	mirrorDB := tracker.MustOpenMirrorDB(cli.DatabaseAddr, cli.DatabasePass)
	defer mirrorDB.Close()

	srv := asynq.NewServer(
		asynq.RedisClientOpt{
			Addr:     cli.DatabaseAddr,
			Password: cli.DatabasePass,
			DB:       tracker.QueueID,
		},
		asynq.Config{
			Concurrency: cli.Concurrency,
			// LogLevel:    asynq.DebugLevel,
		},
	)

	if err = srv.Ping(); err != nil {
		panic(err)
	}

	mux := asynq.NewServeMux()
	mux.Handle(tracker.TaskTypeValidate, tracker.ValidateTaskHandler{MirrorDB: mirrorDB})

	if err := srv.Run(mux); err != nil {
		log.Fatal(err)
	}
}
