package org.example.model;

import java.util.ArrayList;
import java.util.List;

public class RepositorioEstudiante {
    private final List<Estudiante> estudiantes;

    public RepositorioEstudiante() {
        this.estudiantes = new ArrayList<>();
    }

    public boolean existeId(String id) {
        return buscarPorId(id) != null;
    }

    public void guardar(Estudiante estudiante) {
        estudiantes.add(estudiante);
    }

    public Estudiante buscarPorId(String id) {
        for (Estudiante estudiante : estudiantes) {
            if (estudiante.getId().equalsIgnoreCase(id)) {
                return estudiante;
            }
        }
        return null;
    }

    public void actualizar(Estudiante estudianteActualizado) {
        for (int i = 0; i < estudiantes.size(); i++) {
            if (estudiantes.get(i).getId().equalsIgnoreCase(estudianteActualizado.getId())) {
                estudiantes.set(i, estudianteActualizado);
                return;
            }
        }
    }

    public void eliminar(String id) {
        estudiantes.removeIf(estudiante -> estudiante.getId().equalsIgnoreCase(id));
    }

    public List<Estudiante> listarTodos() {
        return new ArrayList<>(estudiantes);
    }
}
