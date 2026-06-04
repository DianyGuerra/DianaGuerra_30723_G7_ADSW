package org.example.controller.strategy;

import org.example.model.Estudiante;

import java.util.List;

public interface IEstrategiaBusquedaEstudiante {
    List<Estudiante> buscar(List<Estudiante> estudiantes, String criterio);
}
