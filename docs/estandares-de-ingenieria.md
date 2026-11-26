# Estándares de ingeniería

Estas reglas aplican a toda contribución, hecha por una persona o por una IA.

## Flujo de trabajo
1. Cada cambio parte de una tarea escrita (ver `plantilla-de-tarea.md`) con criterios de aceptación.
2. Una rama por tarea, con nombre `tipo/descripcion-corta` (`feat/`, `fix/`, `docs/`, `chore/`).
3. Todo entra por pull request hacia `main`; `main` no recibe commits directos.
4. El responsable técnico aprueba cada PR (ver `revision-de-pr.md`). Quien escribió el cambio no lo aprueba.
5. Commits pequeños con mensaje en imperativo (`Agregar entidad Cartera`). Un PR hace una sola cosa.

## Calidad automática (el CI debe estar en verde para fusionar)
- Backend: `mvn verify` corre tests unitarios y de integración, reglas de arquitectura (ArchUnit) y cobertura mínima de líneas (JaCoCo, hoy 60 %; se sube con el tiempo).
- Frontend: `npm run build` (verificación de tipos estricta + build).
- No se baja la cobertura mínima ni se desactivan reglas para que pase un cambio.

## Pruebas
- Toda regla de negocio nueva lleva tests unitarios. Todo endpoint nuevo lleva al menos: caso feliz, validación, no autenticado y **acceso a datos de otra organización** (debe responder 404).
- Las migraciones se prueban aplicándolas completas sobre una base vacía.
- Los tests usan datos ficticios, siempre.

## Código
- Java: inyección por constructor, sin lógica de negocio en controladores, DTOs separados de las entidades, validación con Bean Validation, errores con `ProblemDetail`, sin `System.out`, sin capturar `Exception` salvo en el manejador global.
- Base de datos: cambios solo con migraciones nuevas (`V<n>__descripcion.sql`); nunca se edita una migración ya fusionada. Claves, índices y restricciones explícitos.
- TypeScript: `strict` activado, sin `any` salvo justificación en el PR.
- Tiempos: se guardan en UTC y se muestran en America/Argentina/Buenos_Aires. Los plazos son fechas sin hora; las audiencias, fecha y hora.
- Dinero: nunca `double`; `DECIMAL` en base y `BigDecimal` en Java. Cada monto lleva su unidad (pesos, UMA, jurista, JUS previsional, dólares, MED); no se convierten ni se suman unidades distintas.

## Seguridad y datos (ver `checklist-seguridad-y-datos.md`)
- Secretos solo en variables de entorno; nunca en el repositorio.
- Sin datos reales de clientes en el código, los tests, los logs ni los issues. El repositorio es público.
- Dependencias: se agregan con versión fija y se revisan antes de aceptar; se mantienen actualizadas.

## Observabilidad
- Logs estructurados, sin datos personales ni de casos. Un identificador de solicitud por llamada.
- Salud del servicio en `/actuator/health`.

## Documentación
- Las decisiones de arquitectura se registran en `docs/adr/`.
- Cada módulo nuevo documenta su responsabilidad en el PR y, si cambia reglas generales, en un ADR.
