FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY . .
RUN mvn package -DskipTests || echo "pom.xml not found yet"

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar || echo "jar not found yet"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
