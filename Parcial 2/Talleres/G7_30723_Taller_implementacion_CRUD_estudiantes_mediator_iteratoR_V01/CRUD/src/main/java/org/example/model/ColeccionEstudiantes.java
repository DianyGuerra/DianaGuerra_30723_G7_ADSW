package org.example.model;

public interface ColeccionEstudiantes {
    IteradorEstudiante crearIterador();
    void agregar(Estudiante estudiante);
    void eliminar(String id);
    Estudiante obtener(int posicion);
    int cantidad();
}
