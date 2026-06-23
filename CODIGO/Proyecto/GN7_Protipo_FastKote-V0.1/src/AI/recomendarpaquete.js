import Groq from "groq-sdk";
import paquetes from "../../paquetes.json";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const systemPrompt = `
Eres un asistente de recomendación para FastKote, sistema de cotizaciones del negocio "Chichi está de fiesta".

Tu tarea es recomendar el paquete más adecuado usando únicamente la base de conocimiento entregada.

Debes considerar:
- tipo de evento
- número de invitados
- presupuesto
- fecha
- servicios incluidos
- promociones disponibles

Devuelve SOLO un JSON válido con esta estructura:
{
  "paquete_recomendado": "",
  "promocion_aplicable": "",
  "servicios_adicionales": [],
  "precio_estimado": 0,
  "nivel_ajuste": "alto | medio | bajo",
  "justificacion": ""
}
`;

export async function recomendarPaquete(datosEvento) {
  const respuesta = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: JSON.stringify({
          datosEvento,
          paquetesDisponibles: paquetes
        })
      }
    ]
  });

  return JSON.parse(respuesta.choices[0].message.content);
}
