package org.example.view;

import org.example.model.Estudiante;

import javax.swing.*;
import java.awt.*;

public class FormularioDatosEstudiante extends ComponenteCrudEstudiante {
	private JTextField txtId = new JTextField();
	private JTextField txtNombre = new JTextField();
	private JTextField txtEdad = new JTextField();
	private TablaEstudiantes tabla = new TablaEstudiantes();
	private PanelAccionesEstudiante acciones = new PanelAccionesEstudiante();

	public FormularioDatosEstudiante() {
		configurarVentana();
	}

	@Override
	public void setMediador(org.example.mediator.IMediadorCrudEstudiante mediador) {
		super.setMediador(mediador);
		acciones.setMediador(mediador);
		tabla.setMediador(mediador);
	}

	private void configurarVentana() {
		setTitle("CRUD Estudiantes");
		setSize(620, 520);
		setDefaultCloseOperation(EXIT_ON_CLOSE);
		setLayout(new BorderLayout(10, 10));

		JPanel pnlInput = new JPanel(new GridBagLayout());
		pnlInput.setBorder(javax.swing.BorderFactory.createEmptyBorder(12, 12, 0, 12));
		GridBagConstraints gbc = new GridBagConstraints();
		gbc.insets = new java.awt.Insets(6, 6, 6, 6);
		gbc.fill = GridBagConstraints.HORIZONTAL;

		gbc.gridx = 0; gbc.gridy = 0; pnlInput.add(new JLabel("ID:"), gbc);
		gbc.gridx = 1; gbc.gridy = 0; pnlInput.add(txtId, gbc);
		gbc.gridx = 0; gbc.gridy = 1; pnlInput.add(new JLabel("Nombre:"), gbc);
		gbc.gridx = 1; gbc.gridy = 1; pnlInput.add(txtNombre, gbc);
		gbc.gridx = 0; gbc.gridy = 2; pnlInput.add(new JLabel("Edad:"), gbc);
		gbc.gridx = 1; gbc.gridy = 2; pnlInput.add(txtEdad, gbc);


		Font f = new Font("Segoe UI", Font.PLAIN, 13);
		txtId.setFont(f); txtNombre.setFont(f); txtEdad.setFont(f);
		txtId.setPreferredSize(new java.awt.Dimension(200, 28));
		txtNombre.setPreferredSize(new java.awt.Dimension(200, 28));
		txtEdad.setPreferredSize(new java.awt.Dimension(80, 28));

		add(pnlInput, BorderLayout.NORTH);

		JPanel center = new JPanel(new BorderLayout());
		center.setBorder(javax.swing.BorderFactory.createEmptyBorder(0, 12, 12, 12));
		center.add(acciones.getPanel(), BorderLayout.NORTH);
		center.add(tabla.getComponent(), BorderLayout.CENTER);
		add(center, BorderLayout.CENTER);

		setLocationRelativeTo(null);
	}

	public String obtenerId() { return txtId.getText(); }
	public String obtenerNombre() { return txtNombre.getText(); }
	public int obtenerEdad() {
		try { return Integer.parseInt(txtEdad.getText()); } catch (Exception e) { return -1; }
	}

	public void cargarEstudiante(Estudiante estudiante) {
		if (estudiante != null) {
			txtId.setText(estudiante.getId());
			txtNombre.setText(estudiante.getNombre());
			txtEdad.setText(String.valueOf(estudiante.getEdad()));
			acciones.habilitarEdicion();
		}
	}

	public void limpiarCampos() {
		txtId.setText(""); txtNombre.setText(""); txtEdad.setText("");
		acciones.deshabilitarEdicion();
	}

	public void mostrarMensaje(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }

	public TablaEstudiantes getTabla() { return tabla; }
	public PanelAccionesEstudiante getAcciones() { return acciones; }
}
