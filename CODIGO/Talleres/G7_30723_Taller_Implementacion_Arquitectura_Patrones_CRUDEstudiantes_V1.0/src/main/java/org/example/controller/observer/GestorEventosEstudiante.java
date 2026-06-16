package org.example.controller.observer;

import java.util.ArrayList;
import java.util.List;

public class GestorEventosEstudiante implements ISujetoEstudiante {
    private final List<IObservadorEstudiante> observadores;

    public GestorEventosEstudiante() {
        this.observadores = new ArrayList<>();
    }

    @Override
    public void agregarObservador(IObservadorEstudiante observador) {
        observadores.add(observador);
    }

    @Override
    public void eliminarObservador(IObservadorEstudiante observador) {
        observadores.remove(observador);
    }

    @Override
    public void notificar(EventoEstudiante evento) {
        for (IObservadorEstudiante observador : observadores) {
            observador.actualizar(evento);
        }
    }
}
