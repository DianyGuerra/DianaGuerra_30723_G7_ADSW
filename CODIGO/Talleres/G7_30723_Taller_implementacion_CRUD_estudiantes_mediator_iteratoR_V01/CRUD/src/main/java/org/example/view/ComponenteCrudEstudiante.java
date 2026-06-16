package org.example.view;

import org.example.mediator.IMediadorCrudEstudiante;
import javax.swing.*;

public abstract class ComponenteCrudEstudiante extends JFrame {
    protected IMediadorCrudEstudiante mediador;

    public void setMediador(IMediadorCrudEstudiante mediador) {
        this.mediador = mediador;
    }
}
