.PHONY: bin/webmirror-cli bin/webmirror-tracker-api bin/webmirror-tracker-validator clean

all: bin/webmirror-cli bin/webmirror-tracker-api bin/webmirror-tracker-validator

bin/webmirror-cli:
	go build -o bin/webmirror-cli cmd/cli/main.go

bin/webmirror-tracker-api:
	go build -o bin/webmirror-tracker-api cmd/tracker-api/main.go

bin/webmirror-tracker-validator:
	go build -o bin/webmirror-tracker-validator cmd/tracker-validator/main.go

clean:
	rm -f bin/*