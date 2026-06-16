import { env } from '../../shared/config/env.js';

export class WhatsAppGateway {
  async sendQuoteMessage(input: { phone: string; quoteCode: string; total: string; pdfBase64?: string }) {
    if (!env.WHATSAPP_API_URL || !env.WHATSAPP_API_TOKEN) {
      return {
        simulated: true,
        message: `Simulación: cotización ${input.quoteCode} enviada a ${input.phone}.`,
      };
    }

    const response = await fetch(env.WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WHATSAPP_API_TOKEN}`,
      },
      body: JSON.stringify({
        to: input.phone,
        template: 'fastkote_quote',
        quoteCode: input.quoteCode,
        total: input.total,
        pdfBase64: input.pdfBase64,
      }),
    });

    if (!response.ok) {
      return { delivered: false, status: response.status, message: 'El proveedor de WhatsApp no confirmó la entrega.' };
    }

    return { delivered: true, status: response.status };
  }
}
