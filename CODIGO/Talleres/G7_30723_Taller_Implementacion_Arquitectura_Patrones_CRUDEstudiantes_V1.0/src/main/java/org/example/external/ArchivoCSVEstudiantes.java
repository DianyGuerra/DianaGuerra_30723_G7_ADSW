package org.example.external;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class ArchivoCSVEstudiantes {
    private final String rutaArchivo;

    public ArchivoCSVEstudiantes(String rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
    }

    public List<EstudianteExterno> leerRegistros() throws IOException {
        List<EstudianteExterno> estudiantesExternos = new ArrayList<>();

        try (BufferedReader reader = Files.newBufferedReader(Path.of(rutaArchivo))) {
            String linea;
            while ((linea = reader.readLine()) != null) {
                if (linea.trim().isEmpty() || linea.toLowerCase().contains("codigo")) {
                    continue;
                }

                String[] partes = linea.split(",");
                if (partes.length >= 3) {
                    String codigo = partes[0].trim();
                    String nombreCompleto = partes[1].trim();
                    int anios = Integer.parseInt(partes[2].trim());
                    estudiantesExternos.add(new EstudianteExterno(codigo, nombreCompleto, anios));
                }
            }
        }

        return estudiantesExternos;
    }
}
