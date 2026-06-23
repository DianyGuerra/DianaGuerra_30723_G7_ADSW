import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";

export function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden bg-violet-800 p-10 text-white lg:block">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/15 p-3"><AppIcon name="wand" className="h-7 w-7" /></div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-violet-100">FastKote</p>
                <h1 className="text-3xl font-black">Chichi Esta de Fiesta</h1>
              </div>
            </div>
            <p className="mt-8 max-w-md text-lg leading-8 text-violet-50">
              Prototipo academico para centralizar clientes, paquetes, insumos y cotizaciones con PDF y envio por WhatsApp simulado.
            </p>
            <div className="mt-10 grid gap-3">
              {["Cotizaciones con estados y versiones", "Catalogo tecnico para costos", "Paquetes con margen sugerido", "Calendario bloqueado solo por aceptadas"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                  <AppIcon name="check" className="h-5 w-5 text-emerald-200" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md rounded-lg bg-white p-7 shadow-sm ring-1 ring-slate-200">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <AppIcon name="lock" className="h-7 w-7" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-950">Inicio de sesion</h2>
                <p className="mt-1 text-sm text-slate-500">Sistema Generacion de Cotizaciones</p>
              </div>
              <div className="mt-7 grid gap-4">
                <Field label="Usuario" value="admin.cotizaciones" onChange={() => {}} />
                <Field label="Contrasena" value="fastkote123" onChange={() => {}} type="password" />
                <Button onClick={onLogin} className="mt-2 w-full" icon="lock">Ingresar</Button>
              </div>
              <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800 ring-1 ring-amber-100">
                Vista simulada. No valida credenciales reales ni guarda datos en base de datos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
