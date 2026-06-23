export const packagesSeed = [
  {
    id: "infantil-basico",
    name: "Paquete Infantil Basico",
    desc: "Granizado, canguil, mesa principal y transporte local.",
    margin: 35,
    state: "Activo",
    items: [
      { serviceId: "granizado-ilimitado", qty: 1 },
      { serviceId: "canguil-personalizado", qty: 3 },
      { serviceId: "transporte-local", qty: 1 },
    ],
  },
  {
    id: "cierre-curso",
    name: "Cierre de Curso",
    desc: "Servicio escolar con bebidas, snacks y apoyo logistico basico.",
    margin: 32,
    state: "Activo",
    items: [
      { serviceId: "granizado-ilimitado", qty: 2 },
      { serviceId: "canguil-personalizado", qty: 5 },
      { serviceId: "transporte-local", qty: 1 },
    ],
  },
  {
    id: "cocteleria-premium",
    name: "Cocteleria Premium",
    desc: "Barra de cocteleria y servicio por hora para eventos sociales.",
    margin: 42,
    state: "Activo",
    items: [
      { serviceId: "barra-cocteleria", qty: 1 },
      { serviceId: "transporte-local", qty: 1 },
    ],
  },
  {
    id: "mesa-dulce-express",
    name: "Mesa Dulce Express",
    desc: "Mesa dulce basica; se mantiene como referencia historica.",
    margin: 30,
    state: "Inactivo",
    items: [{ serviceId: "cupcakes-tematicos", qty: 4 }],
  },
];
