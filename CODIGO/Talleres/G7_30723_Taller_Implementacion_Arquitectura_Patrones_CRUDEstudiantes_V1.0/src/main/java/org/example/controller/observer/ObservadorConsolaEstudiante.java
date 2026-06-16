package org.example.controller.observer;

public class ObservadorConsolaEstudiante implements IObservadorEstudiante {
    @Override
    public void actualizar(EventoEstudiante evento) {
        System.out.println("[EVENTO CRUD] " + evento.getFechaHora()
                + " | " + evento.getTipoEvento()
                + " | ID: " + evento.getIdEstudiante()
                + " | " + evento.getMensaje());
    }
}
