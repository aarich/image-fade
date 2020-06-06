#GOBIN=$(shell pwd)/bin

#build:
#	go build ./cmd/image-fade

#install:
#	go install ./cmd/image-fade


# GOPATH=$(shell pwd)/vendor:$(shell pwd):$(shell pwd)
GOBIN=$(shell pwd)/bin
GOFILES=$(wildcard cmd/image-fade/*.go)
GONAME=$(shell basename "$(PWD)")
PID=/tmp/go-$(GONAME).pid



build:
	@echo "*** Building $(GOFILES) to ./bin"
	@GOPATH=$(GOPATH) GOBIN=$(GOBIN) go build -o bin/$(GONAME) $(GOFILES)

.PHONY: build
