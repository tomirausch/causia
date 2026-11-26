package com.causia.shared;

/** Recurso inexistente o fuera de la organización del usuario (no se distingue, para no filtrar información). */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
