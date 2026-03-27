.PHONY: build up --java --go --python help

LANG_PARAM = $(filter --java --go --python,$(MAKECMDGOALS))

ifeq ($(LANG_PARAM),--java)
	PROFILE = java
else ifeq ($(LANG_PARAM),--go)
	PROFILE = go
else ifeq ($(LANG_PARAM),--python)
	PROFILE = python
endif

--java --go --python:
	@:

check-lang:
	@if [ -z "$(PROFILE)" ]; then \
		echo "Ошибка: необходимо указать язык. Пример: make build --java"; \
		exit 1; \
	fi

build: check-lang
	docker compose --profile $(PROFILE) build

up: check-lang
	docker compose --profile $(PROFILE) up

help:
	@echo "Использование:"
	@echo "  make build --java    - Собрать проект с Java бэкендом"
	@echo "  make up --go         - Запустить проект с Go бэкендом"
	@echo "  make up --python     - Запустить проект с Python бэкендом"
