FROM python:3.11-slim-bullseye

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install base packages needed for numpy and other scientific packages
RUN pip install --no-cache-dir wheel setuptools

# Install Python packages with specific versions for stability
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py recommender.py .env ./
COPY models/ ./models/
COPY cleaned_data.csv ./

# Create SQLite database directory
RUN mkdir -p /data

# Cleanup
RUN apt-get purge -y --auto-remove build-essential python3-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Configure uvicorn for t2.micro
ENV WORKERS=1
ENV WORKER_CONNECTIONS=100
ENV TIMEOUT=30

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--limit-concurrency", "100", "--timeout-keep-alive", "30"]