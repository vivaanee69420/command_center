# --- Stage 1: Build the Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY new-frontend/package*.json ./
RUN npm install
COPY new-frontend/ ./
RUN npm run build

# --- Stage 2: Final Image ---
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies (for building Python packages)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY COMMAND_OS_BACKEND/ /app/COMMAND_OS_BACKEND/
COPY main.py .

# Copy the built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/static

# Set environment variables
ENV PYTHONPATH=/app/COMMAND_OS_BACKEND
ENV PORT=8765

# Start the application
CMD ["python", "main.py"]
