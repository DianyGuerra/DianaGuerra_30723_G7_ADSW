package org.example.mediator;

import org.example.controller.ControlEstudiante;
import org.example.controller.Resultado;
import org.example.model.Estudiante;
import org.example.model.IteradorEstudiante;
import org.example.view.FormularioDatosEstudiante;
import org.example.view.PanelAccionesEstudiante;
import org.example.view.TablaEstudiantes;

public class MediadorCrudEstudiante implements IMediadorCrudEstudiante {
    private FormularioDatosEstudiante formulario;
    private TablaEstudiantes tabla;
    private PanelAccionesEstudiante acciones;
    private ControlEstudiante control;

    public MediadorCrudEstudiante(ControlEstudiante control, FormularioDatosEstudiante formulario,
                                  TablaEstudiantes tabla, PanelAccionesEstudiante acciones) {
        this.control = control;
        this.formulario = formulario;
        this.tabla = tabla;
        this.acciones = acciones;
        if (this.acciones != null) this.acciones.setMediador(this);
        if (this.tabla != null) this.tabla.setMediador(this);
    }

    @Override
    public void agregar() {
        Resultado r = control.agregarEstudiante(formulario.obtenerId(), formulario.obtenerNombre(), formulario.obtenerEdad());
        formulario.mostrarMensaje(r.getMensaje());
        mostrarTodo();
    }

    @Override
    public void actualizar() {
        Resultado r = control.actualizarEstudiante(formulario.obtenerId(), formulario.obtenerNombre(), formulario.obtenerEdad());
        formulario.mostrarMensaje(r.getMensaje());
        mostrarTodo();
    }

    @Override
    public void eliminar() {
        Resultado r = control.eliminarEstudiante(formulario.obtenerId());
        formulario.mostrarMensaje(r.getMensaje());
        mostrarTodo();
    }

    @Override
    public void mostrarTodo() {
        IteradorEstudiante it = control.mostrarTodos();
        tabla.mostrarTabla(it);
    }

    @Override
    public void estudianteSeleccionado(String id) {
        Estudiante e = control.buscarPorId(id);
        if (e != null) formulario.cargarEstudiante(e);
    }
}
