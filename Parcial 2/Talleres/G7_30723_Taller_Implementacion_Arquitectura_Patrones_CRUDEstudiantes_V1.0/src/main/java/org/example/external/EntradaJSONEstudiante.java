package org.example.external;

import java.util.ArrayList;
import java.util.List;

public class EntradaJSONEstudiante {
    private final String contenidoJSON;

    public EntradaJSONEstudiante(String contenidoJSON) {
        this.contenidoJSON = contenidoJSON == null ? "" : contenidoJSON;
    }

    /**
     * Mantiene el método del diagrama: lee un solo registro.
     * Si el JSON contiene un arreglo, devuelve el primer estudiante válido.
     */
    public EstudianteExterno leerRegistro() {
        List<EstudianteExterno> registros = leerRegistros();
        if (registros.isEmpty()) {
            return new EstudianteExterno("", "", 0);
        }
        return registros.get(0);
    }

    /**
     * Lee uno o varios estudiantes externos desde JSON.
     * Soporta estos dos formatos:
     *
     * Objeto único:
     * {"codigo":"1001", "nombreCompleto":"Ana Martinez", "anios":19}
     *
     * Arreglo:
     * [
     *   {"codigo":"1001", "nombreCompleto":"Ana Martinez", "anios":19},
     *   {"codigo":"1002", "nombreCompleto":"Carlos Lopez", "anios":21}
     * ]
     */
    public List<EstudianteExterno> leerRegistros() {
        List<EstudianteExterno> estudiantes = new ArrayList<>();

        String texto = contenidoJSON.trim();
        if (texto.isEmpty()) {
            return estudiantes;
        }

        List<String> objetosJson = separarObjetosJson(texto);
        for (String objetoJson : objetosJson) {
            String codigo = extraerValorTexto(objetoJson, "codigo");
            String nombreCompleto = extraerValorTexto(objetoJson, "nombreCompleto");
            String aniosTexto = extraerValorNumero(objetoJson, "anios");

            if (!codigo.isBlank() && !nombreCompleto.isBlank() && !aniosTexto.isBlank()) {
                int anios = Integer.parseInt(aniosTexto);
                estudiantes.add(new EstudianteExterno(codigo, nombreCompleto, anios));
            }
        }

        return estudiantes;
    }

    private List<String> separarObjetosJson(String texto) {
        List<String> objetos = new ArrayList<>();
        int nivelLlaves = 0;
        int inicioObjeto = -1;

        for (int i = 0; i < texto.length(); i++) {
            char caracter = texto.charAt(i);

            if (caracter == '{') {
                if (nivelLlaves == 0) {
                    inicioObjeto = i;
                }
                nivelLlaves++;
            } else if (caracter == '}') {
                nivelLlaves--;
                if (nivelLlaves == 0 && inicioObjeto != -1) {
                    objetos.add(texto.substring(inicioObjeto, i + 1));
                    inicioObjeto = -1;
                }
            }
        }

        return objetos;
    }

    private String extraerValorTexto(String objetoJson, String clave) {
        String patron = "\"" + clave + "\"";
        int inicioClave = objetoJson.indexOf(patron);
        if (inicioClave == -1) {
            return "";
        }

        int inicioDosPuntos = objetoJson.indexOf(":", inicioClave);
        int inicioComillas = objetoJson.indexOf("\"", inicioDosPuntos + 1);
        int finComillas = objetoJson.indexOf("\"", inicioComillas + 1);

        if (inicioDosPuntos == -1 || inicioComillas == -1 || finComillas == -1) {
            return "";
        }

        return objetoJson.substring(inicioComillas + 1, finComillas).trim();
    }

    private String extraerValorNumero(String objetoJson, String clave) {
        String patron = "\"" + clave + "\"";
        int inicioClave = objetoJson.indexOf(patron);
        if (inicioClave == -1) {
            return "";
        }

        int inicioDosPuntos = objetoJson.indexOf(":", inicioClave);
        if (inicioDosPuntos == -1) {
            return "";
        }

        int fin = inicioDosPuntos + 1;
        while (fin < objetoJson.length() && objetoJson.charAt(fin) != ',' && objetoJson.charAt(fin) != '}') {
            fin++;
        }

        return objetoJson.substring(inicioDosPuntos + 1, fin)
                .replaceAll("[^0-9]", "")
                .trim();
    }
}
