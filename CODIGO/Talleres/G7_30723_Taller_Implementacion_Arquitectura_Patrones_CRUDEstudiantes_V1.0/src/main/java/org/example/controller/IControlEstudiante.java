package org.example.controller;

import org.example.controller.strategy.IEstrategiaBusquedaEstudiante;
import org.example.controller.strategy.IEstrategiaOrdenamientoEstudiante;
import org.example.model.Estudiante;

import java.util.List;

public interface IControlEstudiante {
    Resultado agregarEstudiante(String id, String nombres, int edad);

    Resultado actualizarEstudiante(String id, String nombres, int edad);

    Resultado eliminarEstudiante(String id);

    List<Estudiante> mostrarTodos();

    List<Estudiante> buscarEstudiantes(String criterio);

    List<Estudiante> mostrarTodosOrdenados();

    boolean validarDatos(String id, String nombres, int edad);

    void cambiarEstrategiaBusqueda(IEstrategiaBusquedaEstudiante estrategia);

    void cambiarEstrategiaOrdenamiento(IEstrategiaOrdenamientoEstudiante estrategia);
}
