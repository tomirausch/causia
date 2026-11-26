# Backend de Causia

Java 21 · Spring Boot 3.3 · MySQL 8.4 · Flyway.

```bash
cp ../.env.example ../.env     # completar contraseñas
docker compose -f ../docker-compose.yml --env-file ../.env up -d mysql
CAUSIA_DB_PASSWORD=... mvn spring-boot:run
mvn verify                      # tests, reglas de arquitectura y cobertura
```

Estado: esqueleto de la fase 1 (organización y usuario, seguridad "denegar por defecto", errores RFC 7807, reglas de arquitectura). Las demás entidades y la autenticación con segundo factor vienen en las tareas siguientes.
