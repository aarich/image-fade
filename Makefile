GOBIN=$(shell pwd)/bin
GOFILES=$(wildcard cmd/image-fade/*.go)
GOFILESTEST=$(wildcard cmd/image-fade/test/*.go)
GONAME=$(shell basename "$(PWD)")
PID=/tmp/go-$(GONAME).pid

test:
	@echo "*** Building $(GOFILESTEST) to ./bin"
	@GOPATH=$(GOPATH) GOBIN=$(GOBIN) go build -o bin/$(GONAME) $(GOFILESTEST)

build:
	@echo "*** Building $(GOFILES) to ./bin"
	@GOPATH=$(GOPATH) GOBIN=$(GOBIN) go build -o bin/$(GONAME) $(GOFILES)

.PHONY: *
