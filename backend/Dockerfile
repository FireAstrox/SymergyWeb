FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl

# Upgrade pip and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY . .

# Set environment variables
ENV FLASK_APP=app.main
ENV FLASK_ENV=development
ENV PYTHONPATH=/app
ENV FLASK_DEBUG=1

# Expose port 5000
EXPOSE 5000

# Run the application
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]
