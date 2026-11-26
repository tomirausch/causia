# Guía de revisión de pull requests

Responsable técnico: revisa implementación, seguridad y calidad. Revisora de requerimientos: confirma que lo construido es lo que se pidió (usando el prototipo o una demo, no el código).

## Checklist técnico
- [ ] El PR hace una sola cosa y coincide con la tarea y sus criterios de aceptación.
- [ ] CI en verde; no se bajó la cobertura ni se desactivó ninguna regla.
- [ ] Hay tests de los casos felices, de error y de **aislamiento entre organizaciones**.
- [ ] Toda consulta de datos se filtra por la organización del usuario; ningún endpoint devuelve entidades JPA directamente.
- [ ] Migraciones nuevas, no editadas; reversibles o con plan de corrección.
- [ ] Sin secretos, sin datos reales, sin datos personales en logs.
- [ ] Dinero con `BigDecimal`/`DECIMAL` y unidad explícita; fechas y horas según las reglas de estándares.
- [ ] Dependencias nuevas justificadas y con versión fija.
- [ ] El PR declara qué no se pudo verificar.

## Checklist de requerimientos
- [ ] El comportamiento coincide con las respuestas de la profesional (ver relevamiento y propuesta V2.3).
- [ ] Los textos de pantalla usan sus términos (cartera, plazo, audiencia, aporte generado/abonado).
- [ ] Las dudas abiertas quedaron registradas como preguntas, no resueltas por suposición.
