-- Modelo de datos de la V1 (ver docs/modelo-de-datos.md).
-- Aislamiento entre organizaciones: toda tabla de negocio lleva organization_id y toda relación entre tablas
-- usa una clave foránea COMPUESTA (organization_id, id). Así la propia base rechaza un vínculo entre datos de
-- organizaciones distintas, aunque falle un filtro en la aplicación.
-- Convenciones: ids UUID en CHAR(36); instantes en UTC con TIMESTAMP(6); plazos como DATE; dinero como DECIMAL.

-- Organización: clave única compuesta para poder referenciarla
ALTER TABLE app_user ADD CONSTRAINT uq_app_user_org_id UNIQUE (organization_id, id);

-- Preferencias de cada profesional para los avisos
CREATE TABLE user_setting (
    user_id                 CHAR(36)   NOT NULL,
    organization_id         CHAR(36)   NOT NULL,
    default_notice_hours    INT        NOT NULL DEFAULT 24,
    date_only_notice_time   TIME       NOT NULL DEFAULT '18:00:00', -- hora por defecto a confirmar con la profesional
    CONSTRAINT pk_user_setting PRIMARY KEY (user_id),
    CONSTRAINT fk_user_setting_user FOREIGN KEY (organization_id, user_id) REFERENCES app_user (organization_id, id),
    CONSTRAINT ck_user_setting_hours CHECK (default_notice_hours > 0)
);

-- Listas editables: fuero, vía, subtipo, unidad de valor y categoría de gasto
CREATE TABLE catalog_item (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    kind             VARCHAR(20)  NOT NULL,
    label            VARCHAR(80)  NOT NULL,
    via_item_id      CHAR(36)     NULL,      -- solo para subtipos: a qué vía pertenecen
    flow_code        CHAR(1)      NULL,      -- solo para subtipos: flujo de etapas A, B o C (a definir para procesos nuevos)
    active           BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order       INT          NOT NULL DEFAULT 0,
    CONSTRAINT pk_catalog_item PRIMARY KEY (id),
    CONSTRAINT uq_catalog_item_org_id UNIQUE (organization_id, id),
    CONSTRAINT uq_catalog_item_label UNIQUE (organization_id, kind, label),
    CONSTRAINT fk_catalog_item_org FOREIGN KEY (organization_id) REFERENCES organization (id),
    CONSTRAINT fk_catalog_item_via FOREIGN KEY (organization_id, via_item_id) REFERENCES catalog_item (organization_id, id),
    CONSTRAINT ck_catalog_item_kind CHECK (kind IN ('FUERO', 'VIA', 'SUBTIPO', 'UNIDAD', 'CATEGORIA_GASTO')),
    CONSTRAINT ck_catalog_item_flow CHECK (flow_code IS NULL OR flow_code IN ('A', 'B', 'C'))
);

-- Carteras (estudio propio o de colegas derivadores) y clientes
CREATE TABLE portfolio (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    name             VARCHAR(120) NOT NULL,
    is_own           BOOLEAN      NOT NULL DEFAULT FALSE,
    active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_portfolio PRIMARY KEY (id),
    CONSTRAINT uq_portfolio_org_id UNIQUE (organization_id, id),
    CONSTRAINT uq_portfolio_name UNIQUE (organization_id, name),
    CONSTRAINT fk_portfolio_org FOREIGN KEY (organization_id) REFERENCES organization (id)
);

CREATE TABLE client (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    portfolio_id     CHAR(36)     NOT NULL,
    name             VARCHAR(160) NOT NULL,
    active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_client PRIMARY KEY (id),
    CONSTRAINT uq_client_org_id UNIQUE (organization_id, id),
    CONSTRAINT uq_client_org_id_portfolio UNIQUE (organization_id, id, portfolio_id),
    CONSTRAINT fk_client_portfolio FOREIGN KEY (organization_id, portfolio_id) REFERENCES portfolio (organization_id, id)
);
CREATE INDEX ix_client_portfolio ON client (organization_id, portfolio_id);

-- Casos
CREATE TABLE case_file (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    code             VARCHAR(20)  NOT NULL,   -- ID único visible, por ejemplo CASO-001
    client_id        CHAR(36)     NOT NULL,
    portfolio_id     CHAR(36)     NOT NULL,   -- debe coincidir con la cartera del cliente (clave compuesta)
    caption          VARCHAR(300) NOT NULL,   -- carátula
    docket_number    VARCHAR(60)  NULL,       -- número de expediente, opcional
    jurisdiction     VARCHAR(10)  NOT NULL,
    fuero_item_id    CHAR(36)     NOT NULL,
    via_item_id      CHAR(36)     NOT NULL,
    subtype_item_id  CHAR(36)     NOT NULL,
    court            VARCHAR(200) NULL,
    modality         VARCHAR(10)  NOT NULL,
    stage_index      INT          NULL,       -- posición en el flujo; no aplica a trámites puntuales
    status           VARCHAR(12)  NOT NULL,
    created_at       TIMESTAMP(6) NOT NULL,
    updated_at       TIMESTAMP(6) NOT NULL,
    version          BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT pk_case_file PRIMARY KEY (id),
    CONSTRAINT uq_case_file_org_id UNIQUE (organization_id, id),
    CONSTRAINT uq_case_file_code UNIQUE (organization_id, code),
    CONSTRAINT fk_case_client FOREIGN KEY (organization_id, client_id, portfolio_id) REFERENCES client (organization_id, id, portfolio_id),
    CONSTRAINT fk_case_fuero FOREIGN KEY (organization_id, fuero_item_id) REFERENCES catalog_item (organization_id, id),
    CONSTRAINT fk_case_via FOREIGN KEY (organization_id, via_item_id) REFERENCES catalog_item (organization_id, id),
    CONSTRAINT fk_case_subtype FOREIGN KEY (organization_id, subtype_item_id) REFERENCES catalog_item (organization_id, id),
    CONSTRAINT ck_case_jurisdiction CHECK (jurisdiction IN ('PROVINCIAL', 'FEDERAL', 'OTRA')),
    CONSTRAINT ck_case_modality CHECK (modality IN ('PROCESO', 'TRAMITE')),
    CONSTRAINT ck_case_status CHECK (status IN ('ACTIVO', 'EN_ESPERA', 'FINALIZADO')),
    CONSTRAINT ck_case_stage CHECK (modality = 'PROCESO' OR stage_index IS NULL),
    CONSTRAINT ck_case_stage_pos CHECK (stage_index IS NULL OR stage_index >= 0)
);
CREATE INDEX ix_case_client ON case_file (organization_id, client_id);
CREATE INDEX ix_case_portfolio_status ON case_file (organization_id, portfolio_id, status);

CREATE TABLE case_history (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    case_id          CHAR(36)     NOT NULL,
    kind             VARCHAR(20)  NOT NULL,
    description      VARCHAR(300) NOT NULL,
    occurred_at      TIMESTAMP(6) NOT NULL,
    actor_user_id    CHAR(36)     NULL,
    CONSTRAINT pk_case_history PRIMARY KEY (id),
    CONSTRAINT fk_case_history_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id),
    CONSTRAINT fk_case_history_actor FOREIGN KEY (organization_id, actor_user_id) REFERENCES app_user (organization_id, id),
    CONSTRAINT ck_case_history_kind CHECK (kind IN ('CREACION', 'ETAPA', 'ESTADO', 'JUDICIALIZACION', 'REAPERTURA'))
);
CREATE INDEX ix_case_history_case ON case_history (organization_id, case_id, occurred_at);

-- Documentos: enlaces a carpetas de Drive (los documentos no se guardan en la base)
CREATE TABLE case_document (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    case_id          CHAR(36)     NOT NULL,
    title            VARCHAR(160) NOT NULL,
    url              VARCHAR(500) NOT NULL,
    created_at       TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_case_document PRIMARY KEY (id),
    CONSTRAINT fk_case_document_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id)
);
CREATE INDEX ix_case_document_case ON case_document (organization_id, case_id);

-- Notas, checklist y plantillas
CREATE TABLE note (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    case_id          CHAR(36)     NOT NULL,
    author_user_id   CHAR(36)     NULL,
    body             TEXT         NOT NULL,
    created_at       TIMESTAMP(6) NOT NULL,
    updated_at       TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_note PRIMARY KEY (id),
    CONSTRAINT fk_note_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id),
    CONSTRAINT fk_note_author FOREIGN KEY (organization_id, author_user_id) REFERENCES app_user (organization_id, id)
);
CREATE INDEX ix_note_case ON note (organization_id, case_id, created_at);

CREATE TABLE task (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    case_id          CHAR(36)     NOT NULL,
    description      VARCHAR(300) NOT NULL,
    done             BOOLEAN      NOT NULL DEFAULT FALSE,
    due_date         DATE         NULL,
    origin           VARCHAR(10)  NOT NULL,
    position         INT          NOT NULL DEFAULT 0,
    created_at       TIMESTAMP(6) NOT NULL,
    completed_at     TIMESTAMP(6) NULL,
    CONSTRAINT pk_task PRIMARY KEY (id),
    CONSTRAINT fk_task_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id),
    CONSTRAINT ck_task_origin CHECK (origin IN ('PLANTILLA', 'MANUAL')),
    CONSTRAINT ck_task_completed CHECK (done OR completed_at IS NULL)
);
CREATE INDEX ix_task_case ON task (organization_id, case_id);

CREATE TABLE checklist_template (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    subtype_item_id  CHAR(36)     NULL,       -- NULL: plantilla de trámite puntual
    modality         VARCHAR(10)  NOT NULL,
    stage_index      INT          NULL,       -- NULL: aplica al caso completo
    step_text        VARCHAR(300) NOT NULL,
    position         INT          NOT NULL,
    CONSTRAINT pk_checklist_template PRIMARY KEY (id),
    CONSTRAINT fk_checklist_subtype FOREIGN KEY (organization_id, subtype_item_id) REFERENCES catalog_item (organization_id, id),
    CONSTRAINT ck_checklist_modality CHECK (modality IN ('PROCESO', 'TRAMITE'))
);
CREATE INDEX ix_checklist_template ON checklist_template (organization_id, subtype_item_id, modality, position);

-- Plazos (solo fecha) y agenda (fecha y hora)
CREATE TABLE deadline (
    id                    CHAR(36)     NOT NULL,
    organization_id       CHAR(36)     NOT NULL,
    case_id               CHAR(36)     NOT NULL,
    description           VARCHAR(300) NOT NULL,
    kind                  VARCHAR(40)  NOT NULL,
    due_date              DATE         NOT NULL,
    grace_applies         BOOLEAN      NOT NULL DEFAULT FALSE, -- las horas de gracia son siempre 2; no se calcula el día hábil
    status                VARCHAR(10)  NOT NULL DEFAULT 'PENDIENTE',
    notice_hours_before   INT          NULL,                  -- NULL: usa la preferencia del usuario
    created_at            TIMESTAMP(6) NOT NULL,
    completed_at          TIMESTAMP(6) NULL,
    CONSTRAINT pk_deadline PRIMARY KEY (id),
    CONSTRAINT uq_deadline_org_id UNIQUE (organization_id, id),
    CONSTRAINT fk_deadline_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id),
    CONSTRAINT ck_deadline_status CHECK (status IN ('PENDIENTE', 'CUMPLIDO')),
    CONSTRAINT ck_deadline_notice CHECK (notice_hours_before IS NULL OR notice_hours_before > 0)
);
CREATE INDEX ix_deadline_due ON deadline (organization_id, status, due_date);
CREATE INDEX ix_deadline_case ON deadline (organization_id, case_id);

CREATE TABLE agenda_event (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    case_id          CHAR(36)     NOT NULL,
    description      VARCHAR(300) NOT NULL,
    starts_at        TIMESTAMP(6) NOT NULL,   -- instante en UTC; se muestra en America/Argentina/Buenos_Aires
    modality         VARCHAR(10)  NOT NULL,
    location         VARCHAR(300) NULL,       -- lugar o enlace
    CONSTRAINT pk_agenda_event PRIMARY KEY (id),
    CONSTRAINT uq_agenda_event_org_id UNIQUE (organization_id, id),
    CONSTRAINT fk_agenda_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id),
    CONSTRAINT ck_agenda_modality CHECK (modality IN ('PRESENCIAL', 'VIRTUAL'))
);
CREATE INDEX ix_agenda_starts ON agenda_event (organization_id, starts_at);

-- Módulo económico: gastos, honorarios y aportes. Cada monto lleva su unidad; no se convierten.
CREATE TABLE expense (
    id                CHAR(36)       NOT NULL,
    organization_id   CHAR(36)       NOT NULL,
    case_id           CHAR(36)       NOT NULL,
    category_item_id  CHAR(36)       NOT NULL,
    expense_date      DATE           NOT NULL,
    amount            DECIMAL(19, 2) NOT NULL,
    status            VARCHAR(10)    NOT NULL,
    CONSTRAINT pk_expense PRIMARY KEY (id),
    CONSTRAINT uq_expense_org_id UNIQUE (organization_id, id),
    CONSTRAINT fk_expense_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id),
    CONSTRAINT fk_expense_category FOREIGN KEY (organization_id, category_item_id) REFERENCES catalog_item (organization_id, id),
    CONSTRAINT ck_expense_status CHECK (status IN ('PENDIENTE', 'PAGADO')),
    CONSTRAINT ck_expense_amount CHECK (amount >= 0)
);
CREATE INDEX ix_expense_case ON expense (organization_id, case_id);

CREATE TABLE fee (
    id               CHAR(36)       NOT NULL,
    organization_id  CHAR(36)       NOT NULL,
    case_id          CHAR(36)       NOT NULL,
    concept          VARCHAR(120)   NOT NULL,
    unit_item_id     CHAR(36)       NOT NULL,  -- UMA, jurista, JUS previsional, pesos, dólares, MED...
    amount           DECIMAL(19, 4) NOT NULL,
    status           VARCHAR(12)    NOT NULL,
    collected_on     DATE           NULL,      -- fecha de cobro; define el mes del control de ingresos
    CONSTRAINT pk_fee PRIMARY KEY (id),
    CONSTRAINT uq_fee_org_id UNIQUE (organization_id, id),
    CONSTRAINT fk_fee_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id),
    CONSTRAINT fk_fee_unit FOREIGN KEY (organization_id, unit_item_id) REFERENCES catalog_item (organization_id, id),
    CONSTRAINT ck_fee_status CHECK (status IN ('PACTADO', 'REGULADO', 'EN_EJECUCION', 'COBRADO')),
    CONSTRAINT ck_fee_collected CHECK (status <> 'COBRADO' OR collected_on IS NOT NULL),
    CONSTRAINT ck_fee_amount CHECK (amount >= 0)
);
CREATE INDEX ix_fee_case ON fee (organization_id, case_id);
CREATE INDEX ix_fee_collected ON fee (organization_id, collected_on);

CREATE TABLE contribution (
    id                CHAR(36)       NOT NULL,
    organization_id   CHAR(36)       NOT NULL,
    case_id           CHAR(36)       NOT NULL,
    status            VARCHAR(10)    NOT NULL,  -- GENERADO o ABONADO: se cuentan por separado
    amount            DECIMAL(19, 2) NOT NULL,
    contribution_date DATE           NOT NULL,
    passed_to_client  BOOLEAN        NOT NULL DEFAULT FALSE,  -- se traslada al cliente sin facturarse
    CONSTRAINT pk_contribution PRIMARY KEY (id),
    CONSTRAINT uq_contribution_org_id UNIQUE (organization_id, id),
    CONSTRAINT fk_contribution_case FOREIGN KEY (organization_id, case_id) REFERENCES case_file (organization_id, id),
    CONSTRAINT ck_contribution_status CHECK (status IN ('GENERADO', 'ABONADO')),
    CONSTRAINT ck_contribution_amount CHECK (amount >= 0)
);
CREATE INDEX ix_contribution_case ON contribution (organization_id, case_id);

-- Comprobantes adjuntos: pertenecen a exactamente un gasto, honorario o aporte (boleta y ticket de los aportes)
CREATE TABLE attachment (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    expense_id       CHAR(36)     NULL,
    fee_id           CHAR(36)     NULL,
    contribution_id  CHAR(36)     NULL,
    kind             VARCHAR(15)  NOT NULL,
    storage_key      VARCHAR(300) NOT NULL,   -- referencia interna al archivo; el archivo no va en la base
    content_type     VARCHAR(100) NOT NULL,
    size_bytes       BIGINT       NOT NULL,
    created_at       TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_attachment PRIMARY KEY (id),
    CONSTRAINT fk_attachment_expense FOREIGN KEY (organization_id, expense_id) REFERENCES expense (organization_id, id),
    CONSTRAINT fk_attachment_fee FOREIGN KEY (organization_id, fee_id) REFERENCES fee (organization_id, id),
    CONSTRAINT fk_attachment_contribution FOREIGN KEY (organization_id, contribution_id) REFERENCES contribution (organization_id, id),
    CONSTRAINT ck_attachment_kind CHECK (kind IN ('COMPROBANTE', 'FACTURA', 'BOLETA', 'TICKET')),
    CONSTRAINT ck_attachment_size CHECK (size_bytes > 0),
    CONSTRAINT ck_attachment_owner CHECK (
        (CASE WHEN expense_id IS NULL THEN 0 ELSE 1 END)
      + (CASE WHEN fee_id IS NULL THEN 0 ELSE 1 END)
      + (CASE WHEN contribution_id IS NULL THEN 0 ELSE 1 END) = 1)
);

-- Avisos por correo y auditoría
CREATE TABLE notification (
    id                CHAR(36)     NOT NULL,
    organization_id   CHAR(36)     NOT NULL,
    user_id           CHAR(36)     NOT NULL,
    deadline_id       CHAR(36)     NULL,
    agenda_event_id   CHAR(36)     NULL,
    kind              VARCHAR(20)  NOT NULL,
    scheduled_for     TIMESTAMP(6) NOT NULL,
    status            VARCHAR(10)  NOT NULL,
    attempts          INT          NOT NULL DEFAULT 0,
    idempotency_key   VARCHAR(120) NOT NULL,  -- evita avisos duplicados
    provider_response VARCHAR(500) NULL,
    sent_at           TIMESTAMP(6) NULL,
    CONSTRAINT pk_notification PRIMARY KEY (id),
    CONSTRAINT uq_notification_key UNIQUE (organization_id, idempotency_key),
    CONSTRAINT fk_notification_user FOREIGN KEY (organization_id, user_id) REFERENCES app_user (organization_id, id),
    CONSTRAINT fk_notification_deadline FOREIGN KEY (organization_id, deadline_id) REFERENCES deadline (organization_id, id),
    CONSTRAINT fk_notification_event FOREIGN KEY (organization_id, agenda_event_id) REFERENCES agenda_event (organization_id, id),
    CONSTRAINT ck_notification_kind CHECK (kind IN ('AVISO_PLAZO', 'AVISO_AUDIENCIA', 'RESUMEN_DIARIO')),
    CONSTRAINT ck_notification_status CHECK (status IN ('PROGRAMADA', 'ENVIADA', 'FALLIDA', 'CANCELADA')),
    CONSTRAINT ck_notification_attempts CHECK (attempts >= 0)
);
CREATE INDEX ix_notification_pending ON notification (status, scheduled_for);

CREATE TABLE audit_event (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    actor_user_id    CHAR(36)     NULL,
    action           VARCHAR(60)  NOT NULL,
    entity_type      VARCHAR(40)  NOT NULL,
    entity_id        CHAR(36)     NULL,
    occurred_at      TIMESTAMP(6) NOT NULL,
    metadata         VARCHAR(1000) NULL,      -- solo datos no sensibles
    CONSTRAINT pk_audit_event PRIMARY KEY (id),
    CONSTRAINT fk_audit_org FOREIGN KEY (organization_id) REFERENCES organization (id)
);
CREATE INDEX ix_audit_org_time ON audit_event (organization_id, occurred_at);
