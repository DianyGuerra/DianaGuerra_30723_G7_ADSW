package org.example.view;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;

public class PanelAccionesEstudiante extends ComponenteCrudEstudiante {
    private JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 12, 6));
    private JButton btnAgregar = new JButton("Agregar");
    private JButton btnActualizar = new JButton("Actualizar");
    private JButton btnEliminar = new JButton("Eliminar");
    private JButton btnMostrar = new JButton("Mostrar Todo");

    public PanelAccionesEstudiante() {
        panel.setBorder(new EmptyBorder(8, 8, 8, 8));
        Font f = new Font("Segoe UI", Font.PLAIN, 12);
        btnAgregar.setFont(f);
        btnActualizar.setFont(f);
        btnEliminar.setFont(f);
        btnMostrar.setFont(f);

        Dimension btnSize = new Dimension(110, 30);
        btnAgregar.setPreferredSize(btnSize);
        btnActualizar.setPreferredSize(btnSize);
        btnEliminar.setPreferredSize(btnSize);
        btnMostrar.setPreferredSize(btnSize);

        panel.add(btnAgregar);
        panel.add(btnActualizar);
        panel.add(btnEliminar);
        panel.add(btnMostrar);

        btnAgregar.addActionListener(e -> clickAgregar());
        btnActualizar.addActionListener(e -> clickActualizar());
        btnEliminar.addActionListener(e -> clickEliminar());
        btnMostrar.addActionListener(e -> clickMostrarTodo());
    }

    public JPanel getPanel() { return panel; }

    public void clickAgregar() { if (mediador != null) mediador.agregar(); }
    public void clickActualizar() { if (mediador != null) mediador.actualizar(); }
    public void clickEliminar() { if (mediador != null) mediador.eliminar(); }
    public void clickMostrarTodo() { if (mediador != null) mediador.mostrarTodo(); }

    public void habilitarEdicion() {
        btnActualizar.setEnabled(true);
        btnEliminar.setEnabled(true);
        btnAgregar.setEnabled(false);
    }

    public void deshabilitarEdicion() {
        btnActualizar.setEnabled(false);
        btnEliminar.setEnabled(false);
        btnAgregar.setEnabled(true);
    }
}
