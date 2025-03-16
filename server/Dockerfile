FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies with specific PyTorch version
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install torch==2.0.1 torchvision==0.15.2 --index-url https://download.pytorch.org/whl/cpu

# Create models directory
RUN mkdir -p /app/models

# Copy model files (if they exist)
COPY models/ /app/models/

# Copy the application file
COPY app.py .
COPY .env* ./

# Make port 5000 available
EXPOSE 5000

# Define environment variable
ENV MODEL_PATH=/app/models/best_ResNet-50.pth

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
