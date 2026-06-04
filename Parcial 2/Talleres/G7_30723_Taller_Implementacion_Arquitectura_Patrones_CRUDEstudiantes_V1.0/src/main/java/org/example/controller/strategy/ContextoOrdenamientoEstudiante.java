package org.example.controller.strategy;

import org.example.model.Estudiante;

import java.util.ArrayList;
import java.util.List;

public class ContextoOrdenamientoEstudiante {
    private IEstrategiaOrdenamientoEstudiante estrategia;

    public ContextoOrdenamientoEstudiante() {
        this.estrategia = new OrdenarPorIdStrategy();
    }

    public void setEstrategia(IEstrategiaOrdenamientoEstudiante estrategia) {
        if (estrategia != null) {
            this.estrategia = estrategia;
        }
    }

    public List<Estudiante> ejecutarOrdenamiento(List<Estudiante> estudiantes) {
        if (estrategia == null) {
            return new ArrayList<>(estudiantes);
        }
        return estrategia.ordenar(new ArrayList<>(estudiantes));
    }
}
