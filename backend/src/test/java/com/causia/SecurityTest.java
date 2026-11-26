package com.causia;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityTest {

    @Autowired MockMvc mvc;

    @Test
    void saludEsPublica() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void cualquierOtraRutaExigeAutenticacion() throws Exception {
        mvc.perform(get("/api/v1/casos")).andExpect(status().isUnauthorized());
    }

    @Test
    void otrosEndpointsDeActuatorNoEstanExpuestos() throws Exception {
        mvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
    }

    @Test
    void respuestasLlevanCabecerasDeSeguridad() throws Exception {
        mvc.perform(get("/actuator/health"))
            .andExpect(header().exists("X-Content-Type-Options"))
            .andExpect(header().exists("Content-Security-Policy"));
    }
}
