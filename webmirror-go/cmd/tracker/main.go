package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/alecthomas/kong"
	"github.com/webmirror/webmirror/webmirror-go/internal/app/tracker"
)

var cli struct {
	Data *os.File `arg:"true" help:"Path of the data JSON."`
	Addr string   `default:":2020" help:"Address to listen."`
}

func main() {
	ctx := kong.Parse(&cli)
	err := ctx.Error
	if err != nil {
		panic(err)
	}
	defer cli.Data.Close()

	var digestServerMap map[string][]string
	err = json.NewDecoder(cli.Data).Decode(&digestServerMap)
	if err != nil {
		panic(err)
	}

	http.Handle(
		"/v0/descriptions/{digest}/servers",
		tracker.DescriptionServersHandler{
			DigestServerMap: digestServerMap,
		},
	)

	log.Fatal(http.ListenAndServe(cli.Addr, nil))
}
