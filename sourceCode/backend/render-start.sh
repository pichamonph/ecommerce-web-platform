#!/usr/bin/env bash
# Render start script for Spring Boot backend

set -o errexit  # Exit on error

echo "🚀 Starting Spring Boot application..."

# Create uploads directory if it doesn't exist
mkdir -p ${UPLOAD_DIR:-/app/uploads}

# Run the Spring Boot application with prod profile
java -Dserver.port=${PORT:-8080} \
     -Dspring.profiles.active=prod \
     -jar target/*.jar
