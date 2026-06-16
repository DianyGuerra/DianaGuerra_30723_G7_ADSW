package org.example.controller;

import org.example.model.Estudiante;
import org.example.model.RepositorioEstudiante;
import org.example.model.IteradorEstudiante;

public class ControlEstudiante {
    private RepositorioEstudiante repositorio;

    public ControlEstudiante(RepositorioEstudiante repositorio) {
        this.repositorio = repositorio;
    }

    public boolean validarDatos(String id, String nombre, int edad) {
        return id != null && !id.isEmpty() && nombre != null && !nombre.isEmpty() && edad > 0;
    }

    public Resultado agregarEstudiante(String id, String nombre, int edad) {
        if (!validarDatos(id, nombre, edad)) return new Resultado(false, "Datos inválidos.");
        if (repositorio.existeId(id)) return new Resultado(false, "El ID ya existe.");
        repositorio.guardar(new Estudiante(id, nombre, edad));
        return new Resultado(true, "Estudiante agregado.");
    }

    public Resultado actualizarEstudiante(String id, String nombre, int edad) {
        if (!repositorio.existeId(id)) return new Resultado(false, "Estudiante no encontrado.");
        repositorio.actualizar(new Estudiante(id, nombre, edad));
        return new Resultado(true, "Estudiante actualizado.");
    }

    public Resultado eliminarEstudiante(String id) {
        if (!repositorio.existeId(id)) return new Resultado(false, "No existe el estudiante.");
        repositorio.eliminar(id);
        return new Resultado(true, "Estudiante eliminado.");
    }

    public IteradorEstudiante mostrarTodos() {
        return repositorio.listarTodos().crearIterador();
    }

    public Estudiante buscarPorId(String id) {
        return repositorio.buscarPorId(id);
    }
}