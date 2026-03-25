FROM golang:1.22-alpine
WORKDIR /app
COPY . .
RUN go mod init backend-go || true
RUN go build -o main . || echo "main.go not found yet"
EXPOSE 8080
CMD ["./main"]
