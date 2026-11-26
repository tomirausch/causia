package com.causia.shared;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

class ApiExceptionHandlerTest {

    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void noEncontradoDevuelve404() {
        ProblemDetail p = handler.notFound(new NotFoundException("Caso inexistente"));
        assertThat(p.getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(p.getDetail()).isEqualTo("Caso inexistente");
        assertThat(p.getType().toString()).isEqualTo("urn:causia:error:not-found");
    }

    @Test
    void errorInesperadoNoFiltraDetallesInternos() {
        ProblemDetail p = handler.unexpected(new IllegalStateException("clave secreta en el mensaje"));
        assertThat(p.getStatus()).isEqualTo(500);
        assertThat(p.getDetail()).isEqualTo("Error interno").doesNotContain("secreta");
    }
}
