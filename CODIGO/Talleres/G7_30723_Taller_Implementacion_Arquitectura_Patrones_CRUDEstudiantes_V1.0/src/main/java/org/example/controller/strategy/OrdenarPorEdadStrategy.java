package org.example.controller.strategy;

import org.example.model.Estudiante;

import java.util.Comparator;
import java.util.List;

public class OrdenarPorEdadStrategy implements IEstrategiaOrdenamientoEstudiante {
    @Override
    public List<Estudiante> ordenar(List<Estudiante> estudiantes) {
        estudiantes.sort(Comparator.comparingInt(Estudiante::getEdad));
        return estudiantes;
    }
}
