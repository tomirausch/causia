package com.causia;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Verifica que la base misma garantiza el aislamiento entre organizaciones y las reglas de negocio básicas,
 * aunque falle un filtro en la aplicación. Solo datos ficticios.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SchemaIntegrityTest {

    @Autowired JdbcTemplate jdbc;

    private static final List<String> TABLAS = List.of(
        "organization", "app_user", "user_setting", "catalog_item", "portfolio", "client", "case_file", "case_history",
        "case_document", "note", "task", "checklist_template", "deadline", "agenda_event", "expense", "fee",
        "contribution", "attachment", "notification", "audit_event");

    // ---- helpers ----
    private static String id() { return UUID.randomUUID().toString(); }
    private static Timestamp now() { return Timestamp.from(Instant.now()); }

    private String org() {
        String id = id();
        jdbc.update("insert into organization (id, name, created_at) values (?, ?, ?)", id, "Org " + id, now());
        return id;
    }

    private String catalog(String org, String kind, String label) {
        String id = id();
        jdbc.update("insert into catalog_item (id, organization_id, kind, label) values (?, ?, ?, ?)", id, org, kind, label);
        return id;
    }

    private String portfolio(String org, String name) {
        String id = id();
        jdbc.update("insert into portfolio (id, organization_id, name, created_at) values (?, ?, ?, ?)", id, org, name, now());
        return id;
    }

    private String client(String org, String portfolio) {
        String id = id();
        jdbc.update("insert into client (id, organization_id, portfolio_id, name, created_at) values (?, ?, ?, 'Cliente Ficticio', ?)",
            id, org, portfolio, now());
        return id;
    }

    private record Base(String org, String portfolio, String client, String fuero, String via, String subtype) { }

    private Base base() {
        String org = org();
        String portfolio = portfolio(org, "Estudio propio");
        return new Base(org, portfolio, client(org, portfolio),
            catalog(org, "FUERO", "Civil y Comercial"), catalog(org, "VIA", "Judicial"), catalog(org, "SUBTIPO", "Daños y perjuicios"));
    }

    private String caseFile(Base b, String code, String clientId, String portfolioId, String modality, Integer stage, String status) {
        String id = id();
        jdbc.update("""
            insert into case_file (id, organization_id, code, client_id, portfolio_id, caption, jurisdiction, fuero_item_id,
                via_item_id, subtype_item_id, modality, stage_index, status, created_at, updated_at)
            values (?, ?, ?, ?, ?, 'Actor c. Demandado', 'PROVINCIAL', ?, ?, ?, ?, ?, ?, ?, ?)""",
            id, b.org(), code, clientId, portfolioId, b.fuero(), b.via(), b.subtype(), modality, stage, status, now(), now());
        return id;
    }

    private String validCase(Base b) { return caseFile(b, "CASO-001", b.client(), b.portfolio(), "PROCESO", 0, "ACTIVO"); }

    // ---- tests ----
    @Test
    void existenTodasLasTablasDelModelo() {
        for (String t : TABLAS) {
            assertThatCode(() -> jdbc.queryForObject("select count(*) from " + t, Integer.class))
                .as("tabla %s", t).doesNotThrowAnyException();
        }
    }

    @Test
    void casoValidoSeGuarda() {
        assertThatCode(() -> validCase(base())).doesNotThrowAnyException();
    }

    @Test
    void clienteNoPuedeApuntarACarteraDeOtraOrganizacion() {
        String orgA = org();
        String orgB = org();
        String carteraB = portfolio(orgB, "Cartera B");
        assertThatThrownBy(() -> client(orgA, carteraB)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void casoNoPuedeUsarClienteDeOtraOrganizacion() {
        Base a = base();
        Base b = base();
        assertThatThrownBy(() -> caseFile(a, "CASO-001", b.client(), b.portfolio(), "PROCESO", 0, "ACTIVO"))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void casoDebeUsarLaCarteraDeSuCliente() {
        Base a = base();
        String otraCartera = portfolio(a.org(), "Cartera colega");
        assertThatThrownBy(() -> caseFile(a, "CASO-001", a.client(), otraCartera, "PROCESO", 0, "ACTIVO"))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void casoNoPuedeUsarListasEditablesDeOtraOrganizacion() {
        Base a = base();
        Base b = base();
        Base mezclada = new Base(a.org(), a.portfolio(), a.client(), b.fuero(), a.via(), a.subtype());
        assertThatThrownBy(() -> caseFile(mezclada, "CASO-001", a.client(), a.portfolio(), "PROCESO", 0, "ACTIVO"))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void codigoDeCasoEsUnicoPorOrganizacionPeroSePuedeRepetirEnOtra() {
        Base a = base();
        Base b = base();
        validCase(a);
        assertThatThrownBy(() -> validCase(a)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatCode(() -> validCase(b)).doesNotThrowAnyException();
    }

    @Test
    void tramitePuntualNoTieneEtapa() {
        Base a = base();
        assertThatThrownBy(() -> caseFile(a, "CASO-001", a.client(), a.portfolio(), "TRAMITE", 1, "ACTIVO"))
            .isInstanceOf(DataIntegrityViolationException.class);
        assertThatCode(() -> caseFile(a, "CASO-002", a.client(), a.portfolio(), "TRAMITE", null, "ACTIVO")).doesNotThrowAnyException();
    }

    @Test
    void estadoDeCasoDebeSerValido() {
        Base a = base();
        assertThatThrownBy(() -> caseFile(a, "CASO-001", a.client(), a.portfolio(), "PROCESO", 0, "ARCHIVADO"))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void honorarioCobradoExigeFechaDeCobro() {
        Base a = base();
        String caseId = validCase(a);
        String unidad = catalog(a.org(), "UNIDAD", "JUS previsional");
        String sql = "insert into fee (id, organization_id, case_id, concept, unit_item_id, amount, status, collected_on) values (?, ?, ?, 'Regulación', ?, 28, ?, ?)";
        assertThatThrownBy(() -> jdbc.update(sql, id(), a.org(), caseId, unidad, "COBRADO", null))
            .isInstanceOf(DataIntegrityViolationException.class);
        assertThatCode(() -> jdbc.update(sql, id(), a.org(), caseId, unidad, "REGULADO", null)).doesNotThrowAnyException();
    }

    @Test
    void honorarioNoPuedeUsarUnidadDeOtraOrganizacion() {
        Base a = base();
        Base b = base();
        String caseId = validCase(a);
        String unidadB = catalog(b.org(), "UNIDAD", "UMA");
        assertThatThrownBy(() -> jdbc.update(
            "insert into fee (id, organization_id, case_id, concept, unit_item_id, amount, status) values (?, ?, ?, 'x', ?, 1, 'PACTADO')",
            id(), a.org(), caseId, unidadB)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void adjuntoPerteneceAExactamenteUnaEntidad() {
        Base a = base();
        String caseId = validCase(a);
        String categoria = catalog(a.org(), "CATEGORIA_GASTO", "Tasa de justicia");
        String unidad = catalog(a.org(), "UNIDAD", "Pesos");
        String gasto = id();
        String honorario = id();
        jdbc.update("insert into expense (id, organization_id, case_id, category_item_id, expense_date, amount, status) values (?, ?, ?, ?, current_date, 100, 'PENDIENTE')",
            gasto, a.org(), caseId, categoria);
        jdbc.update("insert into fee (id, organization_id, case_id, concept, unit_item_id, amount, status) values (?, ?, ?, 'x', ?, 1, 'PACTADO')",
            honorario, a.org(), caseId, unidad);
        String sql = "insert into attachment (id, organization_id, expense_id, fee_id, kind, storage_key, content_type, size_bytes, created_at) values (?, ?, ?, ?, 'COMPROBANTE', 'k', 'application/pdf', 10, ?)";
        assertThatThrownBy(() -> jdbc.update(sql, id(), a.org(), null, null, now())).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update(sql, id(), a.org(), gasto, honorario, now())).isInstanceOf(DataIntegrityViolationException.class);
        assertThatCode(() -> jdbc.update(sql, id(), a.org(), gasto, null, now())).doesNotThrowAnyException();
    }

    @Test
    void avisoDuplicadoSeRechazaPorClaveDeIdempotencia() {
        Base a = base();
        String user = id();
        jdbc.update("insert into app_user (id, organization_id, email, password_hash, created_at) values (?, ?, ?, 'hash', ?)",
            user, a.org(), "ficticio@example.com", now());
        String sql = "insert into notification (id, organization_id, user_id, kind, scheduled_for, status, idempotency_key) values (?, ?, ?, 'RESUMEN_DIARIO', ?, 'PROGRAMADA', 'resumen-2026-11-27')";
        assertThatCode(() -> jdbc.update(sql, id(), a.org(), user, now())).doesNotThrowAnyException();
        assertThatThrownBy(() -> jdbc.update(sql, id(), a.org(), user, now())).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void aporteSoloAdmiteGeneradoOAbonado() {
        Base a = base();
        String caseId = validCase(a);
        String sql = "insert into contribution (id, organization_id, case_id, status, amount, contribution_date) values (?, ?, ?, ?, 18000, current_date)";
        assertThatCode(() -> jdbc.update(sql, id(), a.org(), caseId, "GENERADO")).doesNotThrowAnyException();
        assertThatCode(() -> jdbc.update(sql, id(), a.org(), caseId, "ABONADO")).doesNotThrowAnyException();
        assertThatThrownBy(() -> jdbc.update(sql, id(), a.org(), caseId, "PAGADO")).isInstanceOf(DataIntegrityViolationException.class);
    }
}
