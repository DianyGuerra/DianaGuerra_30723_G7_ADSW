package org.example.model;

import java.util.ArrayList;
import java.util.List;

public class ListaEstudiantes implements ColeccionEstudiantes {
    private List<Estudiante> estudiantes = new ArrayList<>();

    @Override
    public IteradorEstudiante crearIterador() {
        return new IteradorListaEstudiantes(this);
    }

    @Override
    public void agregar(Estudiante estudiante) {
        estudiantes.add(estudiante);
    }

    @Override
    public void eliminar(String id) {
        estudiantes.removeIf(e -> e.getId().equals(id));
    }

    @Override
    public Estudiante obtener(int posicion) {
        return estudiantes.get(posicion);
    }

    @Override
    public int cantidad() {
        return estudiantes.size();
    }

    List<Estudiante> getListaInterna() { return estudiantes; }
}
