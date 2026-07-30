# ── Etapa 1: build ────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

COPY src src
RUN ./mvnw package -DskipTests -q

# ── Etapa 2: runtime ──────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# pg_dump para los backups automáticos (compatible con Postgres 15/16)
RUN apk add --no-cache postgresql16-client gzip

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
