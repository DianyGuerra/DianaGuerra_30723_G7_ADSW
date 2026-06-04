package org.example.controller.strategy;

import org.example.model.Estudiante;

import java.util.Comparator;
import java.util.List;

public class OrdenarPorIdStrategy implements IEstrategiaOrdenamientoEstudiante {
    @Override
    public List<Estudiante> ordenar(List<Estudiante> estudiantes) {
        estudiantes.sort(Comparator.comparing(Estudiante::getId));
        return estudiantes;
    }
}
