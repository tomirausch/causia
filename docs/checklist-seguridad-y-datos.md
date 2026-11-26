# Checklist de seguridad y datos

La información de los clientes está cubierta por el secreto profesional y por la Ley 25.326 de protección de datos personales.

## Antes de cargar datos reales (requisitos de salida)
- [ ] Acuerdo de confidencialidad y tratamiento de datos firmado con la profesional.
- [ ] Autenticación con segundo factor activa y probada.
- [ ] Pruebas de aislamiento entre organizaciones en cada endpoint.
- [ ] HTTPS en todos los entornos; cabeceras de seguridad activas.
- [ ] Respaldos automáticos de la base y **restauración probada**.
- [ ] Exportación de los datos de la usuaria disponible.
- [ ] Registro de auditoría de operaciones relevantes (sin contenido sensible).
- [ ] Política de conservación y eliminación definida.
- [ ] Revisión de dependencias y de configuración de producción.

## Reglas permanentes
- El repositorio es público: nunca se suben planillas, PDF, audios, capturas ni nombres de clientes reales. Los datos de ejemplo son inventados.
- Los secretos viven en variables de entorno o en un gestor de secretos, nunca en el código.
- Los logs no incluyen carátulas, nombres de clientes ni contenido de notas.
- Cualquier incidente (credencial expuesta, dato real subido por error) se informa de inmediato; se rotan las credenciales y se purga el historial de git.
