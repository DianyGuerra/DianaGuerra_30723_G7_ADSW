package org.example.controller.strategy;

import org.example.model.Estudiante;

import java.util.List;

public interface IEstrategiaOrdenamientoEstudiante {
    List<Estudiante> ordenar(List<Estudiante> estudiantes);
}
