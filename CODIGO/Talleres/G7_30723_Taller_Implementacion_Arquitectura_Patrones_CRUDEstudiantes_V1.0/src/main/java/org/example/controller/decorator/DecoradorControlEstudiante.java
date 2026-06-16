package org.example.controller.decorator;

import org.example.controller.IControlEstudiante;
import org.example.controller.Resultado;
import org.example.controller.strategy.IEstrategiaBusquedaEstudiante;
import org.example.controller.strategy.IEstrategiaOrdenamientoEstudiante;
import org.example.model.Estudiante;

import java.util.List;

public abstract class DecoradorControlEstudiante implements IControlEstudiante {
    protected final IControlEstudiante control;

    public DecoradorControlEstudiante(IControlEstudiante control) {
        this.control = control;
    }

    @Override
    public Resultado agregarEstudiante(String id, String nombres, int edad) {
        return control.agregarEstudiante(id, nombres, edad);
    }

    @Override
    public Resultado actualizarEstudiante(String id, String nombres, int edad) {
        return control.actualizarEstudiante(id, nombres, edad);
    }

    @Override
    public Resultado eliminarEstudiante(String id) {
        return control.eliminarEstudiante(id);
    }

    @Override
    public List<Estudiante> mostrarTodos() {
        return control.mostrarTodos();
    }

    @Override
    public List<Estudiante> buscarEstudiantes(String criterio) {
        return control.buscarEstudiantes(criterio);
    }

    @Override
    public List<Estudiante> mostrarTodosOrdenados() {
        return control.mostrarTodosOrdenados();
    }

    @Override
    public boolean validarDatos(String id, String nombres, int edad) {
        return control.validarDatos(id, nombres, edad);
    }

    @Override
    public void cambiarEstrategiaBusqueda(IEstrategiaBusquedaEstudiante estrategia) {
        control.cambiarEstrategiaBusqueda(estrategia);
    }

    @Override
    public void cambiarEstrategiaOrdenamiento(IEstrategiaOrdenamientoEstudiante estrategia) {
        control.cambiarEstrategiaOrdenamiento(estrategia);
    }
}
