# ========= Stage 1: Build =========
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# ========= Stage 2: Run =========
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install tools: curl (healthcheck) + su-exec (switch user at runtime)
RUN apk add --no-cache curl su-exec

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Upload path (Render/Railway will mount /data at runtime)
ENV UPLOAD_ROOT=/data/uploads

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Create upload directories (will be overridden by volume mount)
RUN mkdir -p /data/uploads/products /data/uploads/profiles /data/uploads/shops /data/uploads/chat && \
    chown -R spring:spring /data && \
    chmod -R 755 /data

# Expose port
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=5 \
  CMD curl -fsS http://127.0.0.1:${PORT:-8080}/api/health || exit 1

# After platform mounts volume:
# 1) chown /data to spring user
# 2) Switch to spring user and create subdirectories + run app
CMD sh -c "\
  mkdir -p /data && chown -R spring:spring /data && \
  su-exec spring:spring sh -c '\
    mkdir -p ${UPLOAD_ROOT}/products ${UPLOAD_ROOT}/profiles ${UPLOAD_ROOT}/shops ${UPLOAD_ROOT}/chat && \
    java -Dserver.port=${PORT} -Dfile.upload.root=${UPLOAD_ROOT} -jar app.jar' \
"
