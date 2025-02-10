package main

import (
	"log"
	"net/http"

	"github.com/alecthomas/kong"

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

	handler := tracker.MakeHandler(cli.DatabaseAddr, cli.DatabasePass, false)

	if err := http.ListenAndServe(cli.Addr, handler); err != nil {
		log.Println(err)
	}
}
