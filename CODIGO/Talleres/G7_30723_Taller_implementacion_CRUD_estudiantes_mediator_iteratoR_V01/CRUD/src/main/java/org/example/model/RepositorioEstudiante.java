package org.example.model;

public class RepositorioEstudiante {
    private ListaEstudiantes coleccion = new ListaEstudiantes();

    public boolean existeId(String id) {
        return buscarPorId(id) != null;
    }

    public void guardar(Estudiante estudiante) {
        coleccion.agregar(estudiante);
    }

    public Estudiante buscarPorId(String id) {
        for (int i = 0; i < coleccion.cantidad(); i++) {
            Estudiante e = coleccion.obtener(i);
            if (e.getId().equals(id)) return e;
        }
        return null;
    }

    public void actualizar(Estudiante estudiante) {
        Estudiante encontrado = buscarPorId(estudiante.getId());
        if (encontrado != null) {
            encontrado.setNombre(estudiante.getNombre());
            encontrado.setEdad(estudiante.getEdad());
        }
    }

    public void eliminar(String id) {
        coleccion.eliminar(id);
    }

    public ColeccionEstudiantes listarTodos() {
        return coleccion;
    }
}