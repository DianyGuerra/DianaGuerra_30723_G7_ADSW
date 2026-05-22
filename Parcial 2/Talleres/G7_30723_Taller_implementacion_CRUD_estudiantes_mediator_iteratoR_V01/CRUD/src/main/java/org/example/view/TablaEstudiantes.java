package org.example.view;

import org.example.model.Estudiante;
import org.example.model.IteradorEstudiante;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

public class TablaEstudiantes extends ComponenteCrudEstudiante {
    private JTable tabla = new JTable();
    private DefaultTableModel modelo = new DefaultTableModel(new String[]{"ID", "Nombre", "Edad"}, 0);
    private JScrollPane scroll = new JScrollPane(tabla);

    public TablaEstudiantes() {
        tabla.setModel(modelo);
        tabla.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        tabla.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                int row = tabla.getSelectedRow();
                if (row >= 0 && mediador != null) {
                    String id = (String) modelo.getValueAt(row, 0);
                    mediador.estudianteSeleccionado(id);
                }
            }
        });

        tabla.setFillsViewportHeight(true);
        tabla.setRowHeight(24);
        tabla.setFont(new java.awt.Font("Segoe UI", java.awt.Font.PLAIN, 12));
        tabla.getTableHeader().setFont(new java.awt.Font("Segoe UI", java.awt.Font.BOLD, 12));
        tabla.getTableHeader().setReorderingAllowed(false);
        tabla.setShowGrid(true);
        scroll.setPreferredSize(new Dimension(560, 220));
    }

    public Component getComponent() { return scroll; }

    public void mostrarTabla(IteradorEstudiante iterador) {
        modelo.setRowCount(0);
        iterador.primero();
        while (iterador.haySiguiente()) {
            Estudiante e = iterador.siguiente();
            modelo.addRow(new Object[]{e.getId(), e.getNombre(), e.getEdad()});
        }
    }

    public String obtenerIdSeleccionado() {
        int row = tabla.getSelectedRow();
        if (row >= 0) return (String) modelo.getValueAt(row, 0);
        return null;
    }

    public void limpiarTabla() { modelo.setRowCount(0); }
}
