package org.example.controller;

public class Resultado {
    private final boolean exito;
    private final String mensaje;

    public Resultado(boolean exito, String mensaje) {
        this.exito = exito;
        this.mensaje = mensaje;
    }

    public boolean esExitoso() {
        return exito;
    }

    public String getMensaje() {
        return mensaje;
    }
}
