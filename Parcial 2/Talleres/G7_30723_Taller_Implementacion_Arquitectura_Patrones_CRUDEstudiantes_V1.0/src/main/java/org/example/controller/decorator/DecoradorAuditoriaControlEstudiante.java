package org.example.controller.decorator;

import org.example.controller.IControlEstudiante;
import org.example.controller.Resultado;

public class DecoradorAuditoriaControlEstudiante extends DecoradorControlEstudiante {
    private final AuditoriaEstudiante auditoria;

    public DecoradorAuditoriaControlEstudiante(IControlEstudiante control, AuditoriaEstudiante auditoria) {
        super(control);
        this.auditoria = auditoria;
    }

    @Override
    public Resultado agregarEstudiante(String id, String nombres, int edad) {
        Resultado resultado = super.agregarEstudiante(id, nombres, edad);
        registrarAccion("AGREGAR", id, resultado);
        return resultado;
    }

    @Override
    public Resultado actualizarEstudiante(String id, String nombres, int edad) {
        Resultado resultado = super.actualizarEstudiante(id, nombres, edad);
        registrarAccion("ACTUALIZAR", id, resultado);
        return resultado;
    }

    @Override
    public Resultado eliminarEstudiante(String id) {
        Resultado resultado = super.eliminarEstudiante(id);
        registrarAccion("ELIMINAR", id, resultado);
        return resultado;
    }

    private void registrarAccion(String accion, String id, Resultado resultado) {
        auditoria.registrarEvento(accion, id, resultado.getMensaje());
    }
}
