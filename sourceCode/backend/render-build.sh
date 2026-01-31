#!/usr/bin/env bash
# Render build script for Spring Boot backend

set -o errexit  # Exit on error

echo "🚀 Starting Render build process..."

# Install Maven dependencies and build
echo "📦 Installing dependencies and building application..."
./mvnw clean install -DskipTests

echo "✅ Build completed successfully!"
