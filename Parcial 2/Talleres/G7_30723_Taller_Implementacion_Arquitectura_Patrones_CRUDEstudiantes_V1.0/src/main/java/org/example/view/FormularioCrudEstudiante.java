package org.example.view;

import org.example.controller.IControlEstudiante;
import org.example.controller.Resultado;
import org.example.controller.adapter.IAdaptadorEstudiante;
import org.example.controller.strategy.BusquedaPorIdStrategy;
import org.example.controller.strategy.BusquedaPorNombreStrategy;
import org.example.controller.strategy.OrdenarPorEdadStrategy;
import org.example.controller.strategy.OrdenarPorIdStrategy;
import org.example.external.ArchivoCSVEstudiantes;
import org.example.external.EntradaJSONEstudiante;
import org.example.external.EstudianteExterno;
import org.example.model.Estudiante;

import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.GridLayout;
import java.io.IOException;
import java.util.List;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

public class FormularioCrudEstudiante extends JFrame {
    private final JTextField txtId;
    private final JTextField txtNombres;
    private final JTextField txtEdad;
    private final JTextField txtCriterioBusqueda;
    private final JComboBox<String> cmbBusqueda;
    private final JComboBox<String> cmbOrdenamiento;
    private final JTable tablaEstudiantes;
    private final DefaultTableModel modeloTabla;
    private final IControlEstudiante control;
    private final IAdaptadorEstudiante adaptador;

    public FormularioCrudEstudiante(IControlEstudiante control, IAdaptadorEstudiante adaptador) {
        this.control = control;
        this.adaptador = adaptador;

        setTitle("CRUD Estudiantes - MVC con Patrones");
        setSize(850, 550);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        txtId = new JTextField();
        txtNombres = new JTextField();
        txtEdad = new JTextField();
        txtCriterioBusqueda = new JTextField();

        cmbBusqueda = new JComboBox<>(new String[]{"Buscar por ID", "Buscar por Nombre"});
        cmbOrdenamiento = new JComboBox<>(new String[]{"Ordenar por ID", "Ordenar por Edad"});

        modeloTabla = new DefaultTableModel(new Object[]{"ID", "Nombres", "Edad"}, 0);
        tablaEstudiantes = new JTable(modeloTabla);

        construirInterfaz();
        configurarEventos();
    }

    private void construirInterfaz() {
        JPanel panelDatos = new JPanel(new GridLayout(3, 2, 8, 8));
        panelDatos.add(new JLabel("ID:"));
        panelDatos.add(txtId);
        panelDatos.add(new JLabel("Nombres:"));
        panelDatos.add(txtNombres);
        panelDatos.add(new JLabel("Edad:"));
        panelDatos.add(txtEdad);

        JPanel panelBotonesCrud = new JPanel();
        JButton btnAgregar = new JButton("Agregar");
        JButton btnActualizar = new JButton("Actualizar");
        JButton btnEliminar = new JButton("Eliminar");
        JButton btnMostrarTodo = new JButton("Mostrar todo");
        JButton btnLimpiar = new JButton("Limpiar");

        btnAgregar.addActionListener(event -> clickAgregar());
        btnActualizar.addActionListener(event -> clickActualizar());
        btnEliminar.addActionListener(event -> clickEliminar());
        btnMostrarTodo.addActionListener(event -> clickMostrarTodo());
        btnLimpiar.addActionListener(event -> limpiarCampos());

        panelBotonesCrud.add(btnAgregar);
        panelBotonesCrud.add(btnActualizar);
        panelBotonesCrud.add(btnEliminar);
        panelBotonesCrud.add(btnMostrarTodo);
        panelBotonesCrud.add(btnLimpiar);

        JPanel panelSuperior = new JPanel(new BorderLayout(8, 8));
        panelSuperior.add(panelDatos, BorderLayout.CENTER);
        panelSuperior.add(panelBotonesCrud, BorderLayout.SOUTH);

        JPanel panelBusqueda = new JPanel(new GridLayout(2, 4, 8, 8));
        JButton btnBuscar = new JButton("Buscar");
        JButton btnOrdenar = new JButton("Ordenar");
        JButton btnCargarCSV = new JButton("Cargar CSV");
        JButton btnCargarJSON = new JButton("Cargar JSON");

        btnBuscar.addActionListener(event -> clickBuscar(txtCriterioBusqueda.getText()));
        btnOrdenar.addActionListener(event -> clickMostrarOrdenado());
        btnCargarCSV.addActionListener(event -> seleccionarArchivoCSV());
        btnCargarJSON.addActionListener(event -> solicitarJSON());

        panelBusqueda.add(new JLabel("Criterio:"));
        panelBusqueda.add(txtCriterioBusqueda);
        panelBusqueda.add(cmbBusqueda);
        panelBusqueda.add(btnBuscar);
        panelBusqueda.add(cmbOrdenamiento);
        panelBusqueda.add(btnOrdenar);
        panelBusqueda.add(btnCargarCSV);
        panelBusqueda.add(btnCargarJSON);

        JPanel panelNorte = new JPanel(new BorderLayout(8, 8));
        panelNorte.add(panelSuperior, BorderLayout.NORTH);
        panelNorte.add(panelBusqueda, BorderLayout.SOUTH);

        add(panelNorte, BorderLayout.NORTH);
        add(new JScrollPane(tablaEstudiantes), BorderLayout.CENTER);
    }

    private void configurarEventos() {
        tablaEstudiantes.getSelectionModel().addListSelectionListener(event -> {
            int fila = tablaEstudiantes.getSelectedRow();
            if (fila >= 0) {
                txtId.setText(modeloTabla.getValueAt(fila, 0).toString());
                txtNombres.setText(modeloTabla.getValueAt(fila, 1).toString());
                txtEdad.setText(modeloTabla.getValueAt(fila, 2).toString());
            }
        });

        cmbBusqueda.addActionListener(event -> seleccionarEstrategiaBusqueda(cmbBusqueda.getSelectedItem().toString()));
        cmbOrdenamiento.addActionListener(event -> seleccionarEstrategiaOrdenamiento(cmbOrdenamiento.getSelectedItem().toString()));
    }

    public void clickAgregar() {
        try {
            Resultado resultado = control.agregarEstudiante(
                    txtId.getText(),
                    txtNombres.getText(),
                    Integer.parseInt(txtEdad.getText())
            );
            mostrarMensaje(resultado.getMensaje());
            clickMostrarTodo();
        } catch (NumberFormatException e) {
            mostrarMensaje("La edad debe ser un número entero.");
        }
    }

    public void clickActualizar() {
        try {
            Resultado resultado = control.actualizarEstudiante(
                    txtId.getText(),
                    txtNombres.getText(),
                    Integer.parseInt(txtEdad.getText())
            );
            mostrarMensaje(resultado.getMensaje());
            clickMostrarTodo();
        } catch (NumberFormatException e) {
            mostrarMensaje("La edad debe ser un número entero.");
        }
    }

    public void clickEliminar() {
        Resultado resultado = control.eliminarEstudiante(txtId.getText());
        mostrarMensaje(resultado.getMensaje());
        clickMostrarTodo();
    }

    public void clickMostrarTodo() {
        mostrarTabla(control.mostrarTodos());
    }

    public void clickBuscar(String criterio) {
        seleccionarEstrategiaBusqueda(cmbBusqueda.getSelectedItem().toString());
        mostrarTabla(control.buscarEstudiantes(criterio));
    }

    public void clickMostrarOrdenado() {
        seleccionarEstrategiaOrdenamiento(cmbOrdenamiento.getSelectedItem().toString());
        mostrarTabla(control.mostrarTodosOrdenados());
    }

    public void seleccionarEstrategiaBusqueda(String tipo) {
        if ("Buscar por Nombre".equalsIgnoreCase(tipo)) {
            control.cambiarEstrategiaBusqueda(new BusquedaPorNombreStrategy());
        } else {
            control.cambiarEstrategiaBusqueda(new BusquedaPorIdStrategy());
        }
    }

    public void seleccionarEstrategiaOrdenamiento(String tipo) {
        if ("Ordenar por Edad".equalsIgnoreCase(tipo)) {
            control.cambiarEstrategiaOrdenamiento(new OrdenarPorEdadStrategy());
        } else {
            control.cambiarEstrategiaOrdenamiento(new OrdenarPorIdStrategy());
        }
    }

    public void clickCargarCSV(String rutaArchivo) {
        try {
            ArchivoCSVEstudiantes archivo = new ArchivoCSVEstudiantes(rutaArchivo);
            int cargados = 0;

            for (EstudianteExterno externo : archivo.leerRegistros()) {
                Resultado resultado = adaptador.registrarDesdeExterno(externo);
                if (resultado.esExitoso()) {
                    cargados++;
                }
            }

            mostrarMensaje("Carga CSV finalizada. Registros cargados: " + cargados);
            clickMostrarTodo();
        } catch (IOException | NumberFormatException e) {
            mostrarMensaje("No se pudo cargar el CSV: " + e.getMessage());
        }
    }

    public void clickCargarJSON(String contenidoJSON) {
        try {
            EntradaJSONEstudiante entradaJSON = new EntradaJSONEstudiante(contenidoJSON);
            int cargados = 0;

            for (EstudianteExterno externo : entradaJSON.leerRegistros()) {
                Resultado resultado = adaptador.registrarDesdeExterno(externo);
                if (resultado.esExitoso()) {
                    cargados++;
                }
            }

            mostrarMensaje("Carga JSON finalizada. Registros cargados: " + cargados);
            clickMostrarTodo();
        } catch (NumberFormatException e) {
            mostrarMensaje("El JSON tiene una edad inválida.");
        }
    }

    public void mostrarMensaje(String mensaje) {
        JOptionPane.showMessageDialog(this, mensaje);
    }

    public void mostrarTabla(List<Estudiante> estudiantes) {
        modeloTabla.setRowCount(0);
        for (Estudiante estudiante : estudiantes) {
            modeloTabla.addRow(new Object[]{
                    estudiante.getId(),
                    estudiante.getNombres(),
                    estudiante.getEdad()
            });
        }
    }

    private void seleccionarArchivoCSV() {
        JFileChooser fileChooser = new JFileChooser();
        int seleccion = fileChooser.showOpenDialog(this);
        if (seleccion == JFileChooser.APPROVE_OPTION) {
            clickCargarCSV(fileChooser.getSelectedFile().getAbsolutePath());
        }
    }

    private void solicitarJSON() {
        JFileChooser fileChooser = new JFileChooser();

        int opcion = fileChooser.showOpenDialog(this);

        if (opcion == JFileChooser.APPROVE_OPTION) {
            File archivo = fileChooser.getSelectedFile();

            try {
                String contenidoJSON = Files.readString(archivo.toPath());
                clickCargarJSON(contenidoJSON);
            } catch (IOException e) {
                mostrarMensaje("Error al leer el archivo JSON: " + e.getMessage());
            }
        }
    }

    private void limpiarCampos() {
        txtId.setText("");
        txtNombres.setText("");
        txtEdad.setText("");
        txtCriterioBusqueda.setText("");
        tablaEstudiantes.clearSelection();
    }
}
