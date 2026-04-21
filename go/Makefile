.PHONY: run build clean test seed docker-up docker-down

# Запуск приложения
run:
	go run main.go

# Сборка бинарника
build:
	go build -o bin/api main.go

# Очистка
clean:
	rm -rf bin/

# Тесты
test:
	go test ./... -v

# Сидирование БД
seed:
	go run scripts/seed.go

# Установка зависимостей
deps:
	go mod download
	go mod tidy

# Форматирование кода
fmt:
	go fmt ./...

# Проверка кода
vet:
	go vet ./...

# Запуск линтера (требуется golangci-lint)
lint:
	golangci-lint run

# Docker
docker-build:
	docker build -t golden-liquid-go .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

# Полный цикл
all: fmt vet test build