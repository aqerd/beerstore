.PHONY: build up java go python help migrate migrate-mongo migrate-postgres migrate-mysql

PROFILE = $(filter java go python,$(MAKECMDGOALS))

java go python:
	@:

check-lang:
	@if [ -z "$(PROFILE)" ]; then \
		echo "Ошибка: укажите язык. Пример: make build java"; \
		exit 1; \
	fi

build: check-lang
	docker compose --profile $(PROFILE) build

up: check-lang
	docker compose --profile $(PROFILE) up -d

all-java:
	$(MAKE) build java
	$(MAKE) up java

all-go:
	$(MAKE) build go
	$(MAKE) up go

all-python:
	$(MAKE) build python
	$(MAKE) up python

DB ?=

migrate:
	@if [ -z "$(DB)" ]; then \
		echo "Укажите базу: make migrate DB=mongo|postgres|mysql"; \
		echo "Синонимы: mongo|mongodb|java → MongoDB; postgres|postgresql|python → PostgreSQL; mysql|go → MySQL"; \
		echo "Или: make migrate-mongo | migrate-postgres | migrate-mysql"; \
		exit 1; \
	fi
	@case "$(DB)" in \
		mongo|mongodb|java) $(MAKE) migrate-mongo ;; \
		postgres|postgresql|python) $(MAKE) migrate-postgres ;; \
		mysql|go) $(MAKE) migrate-mysql ;; \
		*) echo "Неизвестное значение DB=$(DB)"; exit 1 ;; \
	esac

migrate-mongo:
	@echo "Поднимаю db-java (MongoDB) и применяю database/mongo-init.js …"
	docker compose --profile java up -d db-java
	docker compose --profile java exec -T db-java mongosh --quiet --file /docker-entrypoint-initdb.d/mongo-init.js
	@echo "Готово: MongoDB (golden_liquid)."

migrate-postgres:
	@echo "Поднимаю db-python (PostgreSQL) и применяю database/postgres-init.sql …"
	docker compose --profile python up -d db-python
	docker compose --profile python exec -T db-python sh -c \
		'psql -v ON_ERROR_STOP=1 -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -f /docker-entrypoint-initdb.d/init.sql'
	@echo "Готово: PostgreSQL."

migrate-mysql:
	@echo "Поднимаю db-go (MySQL) и применяю database/mysql-init.sql …"
	docker compose --profile go up -d db-go
	docker compose --profile go exec -T db-go sh -c \
		'mysql -uroot -p"$$MYSQL_ROOT_PASSWORD" golden_liquid < /docker-entrypoint-initdb.d/init.sql'
	@echo "Готово: MySQL (golden_liquid)."

help:
	@echo "Сборка и запуск (нужен язык: java | go | python):"
	@echo "  make build java|go|python    — собрать образы профиля"
	@echo "  make up java|go|python       — поднять контейнеры"
	@echo "  make all-java|all-go|all-python — build + up"
	@echo ""
	@echo "Наполнение БД демо-данными (скрипты в database/):"
	@echo "  make migrate DB=mongo|postgres|mysql"
	@echo "  make migrate-mongo | migrate-postgres | migrate-mysql"
	@echo "  (контейнер БД поднимется сам, если ещё не запущен)"