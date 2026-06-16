package org.example.controller.strategy;

import org.example.model.Estudiante;

import java.util.ArrayList;
import java.util.List;

public class BusquedaPorNombreStrategy implements IEstrategiaBusquedaEstudiante {
    @Override
    public List<Estudiante> buscar(List<Estudiante> estudiantes, String criterio) {
        List<Estudiante> encontrados = new ArrayList<>();
        String criterioNormalizado = criterio == null ? "" : criterio.trim().toLowerCase();

        for (Estudiante estudiante : estudiantes) {
            if (estudiante.getNombres().toLowerCase().contains(criterioNormalizado)) {
                encontrados.add(estudiante);
            }
        }
        return encontrados;
    }
}
