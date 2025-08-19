# Base image
FROM python:3.12-slim

WORKDIR /app

# Copy all files including credentials
COPY . /app

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
    pytest

# Expose FastAPI port
EXPOSE 8000

# Run app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
