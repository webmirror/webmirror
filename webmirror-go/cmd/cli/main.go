package main

import (
	"github.com/alecthomas/kong"
	"github.com/webmirror/webmirror/webmirror-go/internal/app/cli"
)

var args struct {
	Describe struct {
		Hash string `enum:"sha256,sha384,sha512" default:"sha256" help:"Cryptographic hash function to use. One of 'sha256', 'sha384', or 'sha512'."`
		Path string `arg:"true" type:"existingdir" help:"Path of the directory."`
	} `cmd:"true" help:"Describe the content of a given directory."`
}

func main() {
	ctx := kong.Parse(&args)
	switch ctx.Command() {
	case "describe <path>":
		cli.MainDescribe(args.Describe.Path, args.Describe.Hash)
	default:
		panic(ctx.Command())
	}
}
