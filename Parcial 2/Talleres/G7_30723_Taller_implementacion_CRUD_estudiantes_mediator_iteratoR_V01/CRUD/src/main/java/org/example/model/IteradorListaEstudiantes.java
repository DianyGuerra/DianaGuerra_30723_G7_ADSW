package org.example.model;

public class IteradorListaEstudiantes implements IteradorEstudiante {
    private ListaEstudiantes lista;
    private int posicion = 0;

    public IteradorListaEstudiantes(ListaEstudiantes lista) {
        this.lista = lista;
    }

    @Override
    public void primero() {
        posicion = 0;
    }

    @Override
    public boolean haySiguiente() {
        return posicion < lista.cantidad();
    }

    @Override
    public Estudiante siguiente() {
        return lista.obtener(posicion++);
    }

    @Override
    public Estudiante actual() {
        if (posicion == 0) return null;
        return lista.obtener(posicion - 1);
    }
}
