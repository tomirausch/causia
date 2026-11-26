# Causia
Causia es una aplicación web para que abogadas y abogados gestionen sus casos: fichas con etapas procesales, plazos con avisos por correo, agenda de audiencias, checklists y control de honorarios, gastos y aportes a la Caja Forense. Se desarrolla primero como herramienta de uso personal y está pensada con arquitectura multi-estudio para poder ofrecerla a otros profesionales más adelante.

Estado: prototipo en desarrollo, con datos ficticios.

## Prototipo (frontend)

Prototipo navegable en React + TypeScript, solo con datos ficticios en memoria (sin backend). Sirve para que la profesional valide pantallas y flujos antes de construir el sistema.

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # verificación de tipos + build de producción
```

Pantallas: Inicio (plazos por urgencia y filtro por cartera), Casos (búsqueda, filtros y alta con checklist según subtipo), Ficha del caso (etapas por flujo A/B/C, estados, "Judicializar", notas, checklist, plazos y agenda, módulo económico, enlace a Drive), Calendario interno, Económico global y Ajustes (listas editables y avisos).

Cada pantalla incluye una pregunta marcada como "Para Florencia" para la revisión de requerimientos.

## Reglas del repositorio

- El repositorio es público: **no subir datos reales** de clientes, expedientes, planillas, PDFs ni audios. El `.gitignore` bloquea los formatos más comunes, pero la revisión es manual.
- Todo cambio entra por pull request y lo revisa el responsable técnico.
