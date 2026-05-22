package org.example.model;

public interface IteradorEstudiante {
    void primero();
    boolean haySiguiente();
    Estudiante siguiente();
    Estudiante actual();
}
