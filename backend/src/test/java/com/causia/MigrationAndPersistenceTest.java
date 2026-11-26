package com.causia;

import static org.assertj.core.api.Assertions.assertThat;

import com.causia.tenancy.Organization;
import com.causia.tenancy.OrganizationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/** Las migraciones de Flyway corren completas y el modelo JPA coincide con el esquema (ddl-auto=validate). */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MigrationAndPersistenceTest {

    @Autowired OrganizationRepository organizations;

    @Test
    void guardaYLeeUnaOrganizacion() {
        Organization saved = organizations.saveAndFlush(new Organization("Estudio de prueba"));
        assertThat(organizations.findById(saved.getId())).get()
            .extracting(Organization::getName).isEqualTo("Estudio de prueba");
    }
}
