package org.example;

import org.example.controller.ControlEstudiante;
import org.example.controller.IControlEstudiante;
import org.example.controller.adapter.AdaptadorEntradaEstudiante;
import org.example.controller.adapter.IAdaptadorEstudiante;
import org.example.controller.decorator.AuditoriaEstudiante;
import org.example.controller.decorator.DecoradorAuditoriaControlEstudiante;
import org.example.model.RepositorioEstudiante;
import org.example.view.FormularioCrudEstudiante;

import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            RepositorioEstudiante repositorio = new RepositorioEstudiante();

            IControlEstudiante controlBase = new ControlEstudiante(repositorio);

            IControlEstudiante controlConAuditoria = new DecoradorAuditoriaControlEstudiante(
                    controlBase,
                    new AuditoriaEstudiante()
            );

            IAdaptadorEstudiante adaptador = new AdaptadorEntradaEstudiante(controlConAuditoria);

            FormularioCrudEstudiante formulario = new FormularioCrudEstudiante(
                    controlConAuditoria,
                    adaptador
            );

            formulario.setVisible(true);
        });
    }
}
