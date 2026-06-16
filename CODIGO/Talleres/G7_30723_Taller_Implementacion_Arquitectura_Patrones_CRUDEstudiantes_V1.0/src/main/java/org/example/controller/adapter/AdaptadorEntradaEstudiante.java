package org.example.controller.adapter;

import org.example.controller.IControlEstudiante;
import org.example.controller.Resultado;
import org.example.external.EstudianteExterno;
import org.example.model.Estudiante;

public class AdaptadorEntradaEstudiante implements IAdaptadorEstudiante {
    private final IControlEstudiante control;

    public AdaptadorEntradaEstudiante(IControlEstudiante control) {
        this.control = control;
    }

    @Override
    public Estudiante convertir(EstudianteExterno externo) {
        if (!validarFormatoExterno(externo)) {
            return null;
        }
        return new Estudiante(externo.getCodigo(), externo.getNombreCompleto(), externo.getAnios());
    }

    @Override
    public Resultado registrarDesdeExterno(EstudianteExterno externo) {
        if (!validarFormatoExterno(externo)) {
            return new Resultado(false, "El formato externo del estudiante no es válido.");
        }

        Estudiante estudiante = convertir(externo);
        return control.agregarEstudiante(
                estudiante.getId(),
                estudiante.getNombres(),
                estudiante.getEdad()
        );
    }

    private boolean validarFormatoExterno(EstudianteExterno externo) {
        return externo != null
                && externo.getCodigo() != null && !externo.getCodigo().trim().isEmpty()
                && externo.getNombreCompleto() != null && !externo.getNombreCompleto().trim().isEmpty()
                && externo.getAnios() > 0;
    }
}
