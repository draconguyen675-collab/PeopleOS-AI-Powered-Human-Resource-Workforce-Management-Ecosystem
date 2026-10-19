FROM eclipse-temurin:25-jdk AS build
WORKDIR /build
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
COPY src src
# Integration tests run against PostgreSQL in CI before image publication.
RUN ./mvnw -B -ntp package -DskipTests

FROM eclipse-temurin:25-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && useradd --system --uid 10001 peopleos
WORKDIR /app
COPY --from=build /build/target/peopleos-0.1.0-SNAPSHOT.jar app.jar
USER 10001
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
