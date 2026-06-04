package org.example.controller.strategy;

import org.example.model.Estudiante;

import java.util.ArrayList;
import java.util.List;

public class ContextoBusquedaEstudiante {
    private IEstrategiaBusquedaEstudiante estrategia;

    public ContextoBusquedaEstudiante() {
        this.estrategia = new BusquedaPorIdStrategy();
    }

    public void setEstrategia(IEstrategiaBusquedaEstudiante estrategia) {
        if (estrategia != null) {
            this.estrategia = estrategia;
        }
    }

    public List<Estudiante> ejecutarBusqueda(List<Estudiante> estudiantes, String criterio) {
        if (estrategia == null) {
            return new ArrayList<>();
        }
        return estrategia.buscar(estudiantes, criterio);
    }
}
