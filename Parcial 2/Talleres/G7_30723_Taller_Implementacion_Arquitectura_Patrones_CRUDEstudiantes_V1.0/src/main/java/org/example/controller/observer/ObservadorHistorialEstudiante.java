package org.example.controller.observer;

import java.util.ArrayList;
import java.util.List;

public class ObservadorHistorialEstudiante implements IObservadorEstudiante {
    private final List<EventoEstudiante> historial;

    public ObservadorHistorialEstudiante() {
        this.historial = new ArrayList<>();
    }

    @Override
    public void actualizar(EventoEstudiante evento) {
        historial.add(evento);
    }

    public List<EventoEstudiante> obtenerHistorial() {
        return new ArrayList<>(historial);
    }
}
