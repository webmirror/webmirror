package main

import (
	"log"
	"net/http"

	"github.com/alecthomas/kong"
	"github.com/webmirror/webmirror/webmirror-go/internal/app/tracker"
)

var cli struct {
	Database string `arg:"true" type:"path" help:"Path of the SQLite database."`
	Addr     string `default:":2020" help:"Address to listen."`
}

func main() {
	ctx := kong.Parse(&cli)
	err := ctx.Error
	if err != nil {
		panic(err)
	}

	db, err := tracker.Open(cli.Database)
	if err != nil {
		log.Fatalf("%+v\n", err)
	}

	http.Handle(
		"GET /v0/servers",
		tracker.GetServersHandler{Handler: tracker.Handler{DB: db}},
	)
	http.Handle(
		"POST /v0/servers",
		tracker.PostServersHandler{Handler: tracker.Handler{DB: db}},
	)

	log.Fatal(http.ListenAndServe(cli.Addr, nil))
}
