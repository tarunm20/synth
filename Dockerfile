FROM maven:3.9.5-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy Maven files
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy built jar
COPY --from=builder /app/target/flashcard-generator-0.0.1-SNAPSHOT.jar app.jar

# Run application
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]