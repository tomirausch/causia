-- Base multi-organización. Las demás entidades (cartera, cliente, caso, etc.) se agregan en migraciones siguientes.
CREATE TABLE organization (
    id          CHAR(36)     NOT NULL,
    name        VARCHAR(120) NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_organization PRIMARY KEY (id)
);

CREATE TABLE app_user (
    id               CHAR(36)     NOT NULL,
    organization_id  CHAR(36)     NOT NULL,
    email            VARCHAR(254) NOT NULL,
    password_hash    VARCHAR(100) NOT NULL,
    enabled          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP(6) NOT NULL,
    CONSTRAINT pk_app_user PRIMARY KEY (id),
    CONSTRAINT uq_app_user_email UNIQUE (email),
    CONSTRAINT fk_app_user_org FOREIGN KEY (organization_id) REFERENCES organization (id)
);

CREATE INDEX ix_app_user_org ON app_user (organization_id);
