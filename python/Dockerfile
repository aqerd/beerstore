FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt . || echo "requirements.txt not found yet"
RUN pip install --no-cache-dir -r requirements.txt || echo "requirements.txt not found yet"
COPY . .
EXPOSE 8080
CMD ["python", "main.py"]
