package org.example.controller.decorator;

import java.time.LocalDateTime;

public class AuditoriaEstudiante {
    public void registrarEvento(String accion, String idEstudiante, String mensaje) {
        System.out.println("[AUDITORIA] " + LocalDateTime.now()
                + " | Acción: " + accion
                + " | ID: " + idEstudiante
                + " | Resultado: " + mensaje);
    }
}
