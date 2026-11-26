package com.causia.tenancy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

/**
 * Cuenta que agrupa usuarios y datos. Toda tabla de negocio lleva organization_id:
 * es la base del aislamiento de datos y de la futura venta a otros estudios.
 */
@Entity
@Table(name = "organization")
public class Organization {

    @Id
    @Column(columnDefinition = "char(36)")
    private String id;

    @Column(nullable = false, length = 120)
    private String name;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Organization() { }

    public Organization(String name) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public Instant getCreatedAt() { return createdAt; }
}
