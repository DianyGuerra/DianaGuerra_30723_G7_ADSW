package org.example;

import org.example.model.RepositorioEstudiante;
import org.example.controller.ControlEstudiante;
import org.example.view.FormularioDatosEstudiante;
import org.example.view.TablaEstudiantes;
import org.example.view.PanelAccionesEstudiante;
import org.example.mediator.MediadorCrudEstudiante;
import javax.swing.UIManager;

public class Main {
    public static void main(String[] args) {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) { e.printStackTrace(); }

        RepositorioEstudiante repo = new RepositorioEstudiante();
        ControlEstudiante ctrl = new ControlEstudiante(repo);
        FormularioDatosEstudiante formulario = new FormularioDatosEstudiante();
        MediadorCrudEstudiante mediator = new MediadorCrudEstudiante(ctrl, formulario, formulario.getTabla(), formulario.getAcciones());
        formulario.setMediador(mediator);
        formulario.setVisible(true);
    }
}