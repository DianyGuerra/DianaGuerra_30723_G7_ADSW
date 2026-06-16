package org.example.mediator;

import org.example.model.Estudiante;

public interface IMediadorCrudEstudiante {
    void agregar();
    void actualizar();
    void eliminar();
    void mostrarTodo();
    void estudianteSeleccionado(String id);
}
