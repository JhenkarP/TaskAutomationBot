FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    google-auth \
    google-auth-oauthlib \
    google-api-python-client \
    requests \
    python-dateutil \
    apscheduler \
    psutil \
    pytest \
    httpx \
    pytesseract pillow \
    python-dotenv \
    dnspython

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]