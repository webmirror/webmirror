.PHONY: bin/webmirror-cli bin/webmirror-tracker clean

all: bin/webmirror-cli bin/webmirror-tracker

bin/webmirror-cli:
	go build -o bin/webmirror-cli cmd/cli/main.go

bin/webmirror-tracker:
	go build -o bin/webmirror-tracker cmd/tracker/main.go

clean:
	rm -f bin/*