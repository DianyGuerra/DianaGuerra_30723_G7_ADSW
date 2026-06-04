package org.example.controller;

import org.example.controller.observer.EventoEstudiante;
import org.example.controller.observer.GestorEventosEstudiante;
import org.example.controller.observer.ObservadorConsolaEstudiante;
import org.example.controller.observer.ObservadorHistorialEstudiante;
import org.example.controller.strategy.ContextoBusquedaEstudiante;
import org.example.controller.strategy.ContextoOrdenamientoEstudiante;
import org.example.controller.strategy.IEstrategiaBusquedaEstudiante;
import org.example.controller.strategy.IEstrategiaOrdenamientoEstudiante;
import org.example.model.Estudiante;
import org.example.model.RepositorioEstudiante;

import java.util.List;

public class ControlEstudiante implements IControlEstudiante {
    private final RepositorioEstudiante repositorio;
    private final GestorEventosEstudiante gestorEventos;
    private final ContextoBusquedaEstudiante contextoBusqueda;
    private final ContextoOrdenamientoEstudiante contextoOrdenamiento;

    public ControlEstudiante(RepositorioEstudiante repositorio) {
        this.repositorio = repositorio;
        this.gestorEventos = new GestorEventosEstudiante();
        this.contextoBusqueda = new ContextoBusquedaEstudiante();
        this.contextoOrdenamiento = new ContextoOrdenamientoEstudiante();

        this.gestorEventos.agregarObservador(new ObservadorConsolaEstudiante());
        this.gestorEventos.agregarObservador(new ObservadorHistorialEstudiante());
    }

    @Override
    public Resultado agregarEstudiante(String id, String nombres, int edad) {
        if (!validarDatos(id, nombres, edad)) {
            return new Resultado(false, "Datos inválidos. Revise ID, nombres y edad.");
        }

        if (repositorio.existeId(id.trim())) {
            return new Resultado(false, "Ya existe un estudiante con ese ID.");
        }

        Estudiante estudiante = new Estudiante(id.trim(), nombres.trim(), edad);
        repositorio.guardar(estudiante);

        gestorEventos.notificar(new EventoEstudiante(
                "REGISTRO",
                estudiante.getId(),
                "Estudiante registrado correctamente."
        ));

        return new Resultado(true, "Estudiante agregado correctamente.");
    }

    @Override
    public Resultado actualizarEstudiante(String id, String nombres, int edad) {
        if (!validarDatos(id, nombres, edad)) {
            return new Resultado(false, "Datos inválidos. Revise ID, nombres y edad.");
        }

        if (!repositorio.existeId(id.trim())) {
            return new Resultado(false, "No existe un estudiante con ese ID.");
        }

        Estudiante estudiante = new Estudiante(id.trim(), nombres.trim(), edad);
        repositorio.actualizar(estudiante);

        gestorEventos.notificar(new EventoEstudiante(
                "ACTUALIZACION",
                estudiante.getId(),
                "Estudiante actualizado correctamente."
        ));

        return new Resultado(true, "Estudiante actualizado correctamente.");
    }

    @Override
    public Resultado eliminarEstudiante(String id) {
        if (id == null || id.trim().isEmpty()) {
            return new Resultado(false, "Ingrese un ID para eliminar.");
        }

        if (!repositorio.existeId(id.trim())) {
            return new Resultado(false, "No existe un estudiante con ese ID.");
        }

        repositorio.eliminar(id.trim());

        gestorEventos.notificar(new EventoEstudiante(
                "ELIMINACION",
                id.trim(),
                "Estudiante eliminado correctamente."
        ));

        return new Resultado(true, "Estudiante eliminado correctamente.");
    }

    @Override
    public List<Estudiante> mostrarTodos() {
        return repositorio.listarTodos();
    }

    @Override
    public List<Estudiante> buscarEstudiantes(String criterio) {
        return contextoBusqueda.ejecutarBusqueda(repositorio.listarTodos(), criterio);
    }

    @Override
    public List<Estudiante> mostrarTodosOrdenados() {
        return contextoOrdenamiento.ejecutarOrdenamiento(repositorio.listarTodos());
    }

    @Override
    public boolean validarDatos(String id, String nombres, int edad) {
        return id != null && !id.trim().isEmpty()
                && nombres != null && !nombres.trim().isEmpty()
                && edad > 0;
    }

    @Override
    public void cambiarEstrategiaBusqueda(IEstrategiaBusquedaEstudiante estrategia) {
        contextoBusqueda.setEstrategia(estrategia);
    }

    @Override
    public void cambiarEstrategiaOrdenamiento(IEstrategiaOrdenamientoEstudiante estrategia) {
        contextoOrdenamiento.setEstrategia(estrategia);
    }
}
