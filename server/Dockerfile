FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies and verify gunicorn is installed
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install gunicorn && \
    which gunicorn

# Create models directory
RUN mkdir -p /app/models

# Copy model files (if they exist)
COPY models/ /app/models/

# Copy the rest of the application
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV FLASK_APP=run.py
ENV FLASK_ENV=production
ENV MODEL_PATH=/app/models/best_ResNet-50.pth

# Run the application with explicit path to gunicorn
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
