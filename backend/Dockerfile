# --- Build Stage ---
FROM maven:3.9.16-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B
COPY src ./src
# Build application jar (skipping unit tests to speed up image generation)
RUN mvn package -DskipTests

# --- Runtime Stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
