package org.example.external;

public class EstudianteExterno {
    private final String codigo;
    private final String nombreCompleto;
    private final int anios;

    public EstudianteExterno(String codigo, String nombreCompleto, int anios) {
        this.codigo = codigo;
        this.nombreCompleto = nombreCompleto;
        this.anios = anios;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public int getAnios() {
        return anios;
    }
}
