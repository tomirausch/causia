# Modelo de datos (V1)

Esquema definido en `backend/src/main/resources/db/migration/V2__modelo_de_datos.sql`. Los tests de `SchemaIntegrityTest` verifican sus garantías.

## Principios
- **Aislamiento entre organizaciones en la base.** Toda tabla de negocio lleva `organization_id` y toda relación usa una clave foránea compuesta `(organization_id, id)`. Un caso no puede apuntar a un cliente, una lista o un honorario de otra organización aunque falle un filtro de la aplicación. Esto sigue valiendo si más adelante se ofrece a otros estudios.
- **Integridad de cartera:** el caso lleva la misma cartera que su cliente (clave compuesta `(organización, cliente, cartera)`).
- **Plazos como fecha** (`DATE`, sin hora, con marca de gracia) y **audiencias como instante UTC** (`TIMESTAMP`), mostrado en America/Argentina/Buenos_Aires.
- **Dinero como `DECIMAL`** y siempre con su unidad (lista editable). No hay conversión ni suma entre unidades distintas.
- **Documentos:** solo enlaces (`case_document`); los comprobantes livianos se referencian por `storage_key` y el archivo vive fuera de la base.

## Tablas
| Tabla | Para qué |
|---|---|
| `organization`, `app_user`, `user_setting` | Cuenta, usuarios y preferencias de avisos (24 hs por defecto) |
| `catalog_item` | Listas editables: fuero, vía, subtipo, unidad de valor, categoría de gasto |
| `portfolio`, `client` | Carteras (propia o de colegas) y clientes |
| `case_file`, `case_history` | Casos (ID único, modalidad, vía, subtipo, etapa, estado) e historial |
| `case_document` | Enlaces a carpetas de Drive |
| `note`, `task`, `checklist_template` | Notas, checklist y plantillas por subtipo |
| `deadline`, `agenda_event` | Plazos (solo fecha) y agenda (fecha y hora) |
| `expense`, `fee`, `contribution`, `attachment` | Gastos, honorarios, aportes (generados y abonados) y comprobantes (boleta y ticket) |
| `notification` | Avisos por correo con clave de idempotencia para evitar duplicados |
| `audit_event` | Auditoría de operaciones relevantes, sin datos sensibles |

## Decisiones pendientes (se resuelven con migraciones nuevas)
- `catalog_item.flow_code`: si un proceso nuevo (por ejemplo desalojo) usa uno de los flujos A, B o C o necesita etapas propias editables.
- `user_setting.date_only_notice_time`: hora por defecto del aviso de plazos con solo fecha (hoy 18:00, a confirmar).
- Campos de la boleta y el ticket de aportes (hoy son solo adjuntos del aporte).
- Tamaño máximo y tipos de archivo de los comprobantes (se validan en la aplicación).

## Qué sigue
Las entidades JPA, los repositorios y los endpoints se agregan módulo por módulo (clientes y carteras, casos, plazos, etc.), cada uno con sus tests, siguiendo `docs/estandares-de-ingenieria.md`.
