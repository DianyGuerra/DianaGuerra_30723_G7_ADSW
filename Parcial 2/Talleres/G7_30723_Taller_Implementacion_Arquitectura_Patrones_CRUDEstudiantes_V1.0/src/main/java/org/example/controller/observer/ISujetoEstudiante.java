package org.example.controller.observer;

public interface ISujetoEstudiante {
    void agregarObservador(IObservadorEstudiante observador);

    void eliminarObservador(IObservadorEstudiante observador);

    void notificar(EventoEstudiante evento);
}
