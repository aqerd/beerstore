.PHONY: build up java go python

PROFILE =

java:
	$(MAKE) build PROFILE=java
	$(MAKE) up PROFILE=java

go:
	$(MAKE) build PROFILE=go
	$(MAKE) up PROFILE=go

python:
	$(MAKE) build PROFILE=python
	$(MAKE) up PROFILE=python

build:
	docker compose --profile $(PROFILE) build

up:
	docker compose --profile $(PROFILE) up
