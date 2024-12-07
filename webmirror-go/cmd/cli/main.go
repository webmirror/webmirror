package main

import (
	"github.com/alecthomas/kong"
	"github.com/webmirror/webmirror/webmirror-go/internal/app/cli"
)

var args struct {
	Describe struct {
		Path string `arg:"true" type:"existingdir" help:"Path of the directory."`
	} `cmd:"true" help:"Describe the content of a given directory."`
}

func main() {
	ctx := kong.Parse(&args)
	switch ctx.Command() {
	case "describe <path>":
		cli.MainDescribe(args.Describe.Path)
	default:
		panic(ctx.Command())
	}
}
