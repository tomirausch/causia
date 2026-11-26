# ADR 0001 — Stack y arquitectura

- Estado: aceptada
- Fecha: 2026-11-26
- Decide: responsable técnico (Tomás Rausch)

## Contexto
Causia nace como herramienta personal de una abogada y debe poder ofrecerse después a otros estudios. Maneja información cubierta por el secreto profesional. Una sola persona desarrolla, con apoyo de IA, y otra persona revisa los requerimientos.

## Decisión
- **Backend:** Java 21 + Spring Boot 3.3, API REST con errores RFC 7807.
- **Base de datos:** MySQL 8.4; el esquema se gestiona solo con migraciones Flyway (`ddl-auto=validate`).
- **Frontend:** React + TypeScript (ver `frontend/`).
- **Arquitectura:** monolito modular. Cada módulo de negocio vive en `com.causia.<modulo>` con subpaquetes `web`, `application`, `domain` e `infrastructure`. Los módulos se comunican por interfaces de aplicación, no por tablas ajenas.
- **Multi-organización desde el primer día:** toda tabla de negocio lleva `organization_id` y toda consulta se filtra por la organización del usuario autenticado. Una sola organización en la V1.
- **Seguridad por defecto:** todo endpoint exige autenticación salvo la salud del servicio; segundo factor y autorización por organización se implementan en la fase 1.
- **Documentos:** enlace a Google Drive; solo comprobantes livianos en almacenamiento privado (fase 5).

## Alternativas descartadas
- Microservicios: costo operativo sin beneficio para un equipo de una persona.
- Base de datos por organización: complica respaldos y migraciones; se reevalúa solo si un cliente lo exige.

## Consecuencias
- Un solo despliegue y una sola base simplifican costos y respaldos.
- Las reglas de arquitectura se verifican automáticamente (`ArchitectureTest`), por lo que el monolito puede dividirse más adelante si hace falta.
