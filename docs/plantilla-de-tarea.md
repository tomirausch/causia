# Plantilla de tarea (para delegar a una IA o a una persona)

Copiar, completar y entregar junto con el acceso al repositorio. Una tarea que no se pueda completar con esta plantilla todavía no está lista para delegarse.

```
Título:
Fase y módulo:          (ej. Fase 2 — casos)
Objetivo (una frase):

Contexto que debe leer:
- docs/estandares-de-ingenieria.md
- docs/adr/0001-stack-y-arquitectura.md
- (documentos o pantallas del prototipo que correspondan)

Alcance — SÍ hacer:
-
Fuera de alcance — NO hacer:
-
Archivos o paquetes que puede tocar:
Archivos que NO puede tocar:   (migraciones ya fusionadas, configuración de seguridad, etc.)

Criterios de aceptación (verificables):
- [ ]
- [ ]
Tests exigidos:
- [ ] unitarios de la regla de negocio
- [ ] endpoint: feliz, validación, no autenticado, otra organización
- [ ] migración aplicada sobre base vacía

Datos: solo ficticios.
Definición de terminado: CI en verde, PR con la plantilla completa, sin TODOs sin issue.
Preguntas abiertas que bloquean:   (si las hay, la IA pregunta antes de inventar)
```

## Reglas para delegar a IAs
1. La IA trabaja en una rama y abre un PR; nunca fusiona.
2. Nunca recibe datos reales, credenciales ni acceso a producción.
3. Si falta información de negocio, pregunta; no inventa reglas jurídicas ni de honorarios.
4. Declara en el PR qué verificó y qué **no** pudo verificar (por ejemplo, si no pudo ejecutar los tests).
5. Una segunda IA puede hacer una revisión previa sin haber escrito el código; no reemplaza la revisión humana.
6. Los requisitos funcionales los valida la profesional; la implementación y la seguridad las valida el responsable técnico.
