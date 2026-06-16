package org.example.controller.adapter;

import org.example.controller.Resultado;
import org.example.external.EstudianteExterno;
import org.example.model.Estudiante;

public interface IAdaptadorEstudiante {
    Estudiante convertir(EstudianteExterno externo);

    Resultado registrarDesdeExterno(EstudianteExterno externo);
}
