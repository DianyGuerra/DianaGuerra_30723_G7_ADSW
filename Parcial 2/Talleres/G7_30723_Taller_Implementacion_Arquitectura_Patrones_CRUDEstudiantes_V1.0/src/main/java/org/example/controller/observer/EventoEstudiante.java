package org.example.controller.observer;

import java.time.LocalDateTime;

public class EventoEstudiante {
    private final String tipoEvento;
    private final String idEstudiante;
    private final String mensaje;
    private final LocalDateTime fechaHora;

    public EventoEstudiante(String tipoEvento, String idEstudiante, String mensaje) {
        this.tipoEvento = tipoEvento;
        this.idEstudiante = idEstudiante;
        this.mensaje = mensaje;
        this.fechaHora = LocalDateTime.now();
    }

    public String getTipoEvento() {
        return tipoEvento;
    }

    public String getIdEstudiante() {
        return idEstudiante;
    }

    public String getMensaje() {
        return mensaje;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
}
