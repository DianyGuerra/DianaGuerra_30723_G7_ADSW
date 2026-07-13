import { env } from '../../shared/config/env.js';
function normalizePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    // Si tiene 10 dígitos y empieza con 0, asumimos Ecuador (09xxxxxxx -> 5939xxxxxxx)
    if (digits.length === 10 && digits.startsWith('0')) {
        return '593' + digits.substring(1);
    }
    return digits;
}
export class WhatsAppGateway {
    async sendQuoteMessage(input) {
        if (!env.WHATSAPP_API_URL || !env.WHATSAPP_API_TOKEN) {
            return {
                simulated: true,
                message: `Simulación: cotización ${input.quoteCode} enviada a ${input.phone}.`,
            };
        }
        const normalizedPhone = normalizePhone(input.phone);
        const caption = `¡Hola! Le compartimos la cotización con código *${input.quoteCode}* por un total de *$${input.total}*.`;
        try {
            const isGreenApi = env.WHATSAPP_API_URL.includes('green-api.com') || env.WHATSAPP_API_URL.includes('greenapi.com');
            const isUltraMsg = env.WHATSAPP_API_URL.includes('ultramsg.com');
            if (isGreenApi) {
                // Green API tiene la URL en formato: https://api.green-api.com/waInstance1101859381
                let apiUrl = env.WHATSAPP_API_URL;
                if (!apiUrl.includes('/waInstance')) {
                    const match = apiUrl.match(/https?:\/\/(\d+)\./);
                    if (match && match[1]) {
                        apiUrl = `${apiUrl}/waInstance${match[1]}`;
                    }
                }
                // Para operaciones de multimedia (como sendFileByUpload) se debe usar el host de media (media.greenapi.com)
                let mediaUrl = apiUrl;
                if (mediaUrl.includes('green-api.com')) {
                    mediaUrl = mediaUrl.replace(/https?:\/\/[^\/]+/, 'https://media.green-api.com');
                }
                else if (mediaUrl.includes('greenapi.com')) {
                    mediaUrl = mediaUrl.replace(/https?:\/\/[^\/]+/, 'https://media.greenapi.com');
                }
                // Queremos llamar al método sendFileByUpload si hay PDF, o sendMessage si no.
                if (input.pdfBase64) {
                    const fileBuffer = Buffer.from(input.pdfBase64, 'base64');
                    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
                    const formData = new FormData();
                    formData.append('chatId', `${normalizedPhone}@c.us`);
                    formData.append('file', blob, `cotizacion-${input.quoteCode}.pdf`);
                    formData.append('fileName', `cotizacion-${input.quoteCode}.pdf`);
                    formData.append('caption', caption);
                    const response = await fetch(`${mediaUrl}/sendFileByUpload/${env.WHATSAPP_API_TOKEN}`, {
                        method: 'POST',
                        body: formData,
                    });
                    if (!response.ok) {
                        const errText = await response.text();
                        const errMsg = errText ? errText : `Status ${response.status}`;
                        console.error('Error de Green API (upload):', errMsg);
                        return { delivered: false, status: response.status, message: `Error del proveedor Green API al enviar archivo: ${errMsg}` };
                    }
                    return { delivered: true, status: response.status };
                }
                else {
                    // Envío de solo texto en Green API
                    const response = await fetch(`${apiUrl}/sendMessage/${env.WHATSAPP_API_TOKEN}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chatId: `${normalizedPhone}@c.us`,
                            message: caption,
                        }),
                    });
                    if (!response.ok) {
                        const errText = await response.text();
                        const errMsg = errText ? errText : `Status ${response.status}`;
                        console.error('Error de Green API (text):', errMsg);
                        return { delivered: false, status: response.status, message: `Error del proveedor Green API al enviar mensaje: ${errMsg}` };
                    }
                    return { delivered: true, status: response.status };
                }
            }
            else if (isUltraMsg) {
                // Ultramsg espera que la URL sea https://api.ultramsg.com/instanceXXXXX
                // Y enviamos al endpoint /messages/document
                const response = await fetch(`${env.WHATSAPP_API_URL}/messages/document`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: env.WHATSAPP_API_TOKEN,
                        to: normalizedPhone,
                        filename: `cotizacion-${input.quoteCode}.pdf`,
                        document: `data:application/pdf;base64,${input.pdfBase64 || ''}`,
                        caption: caption,
                    }),
                });
                if (!response.ok) {
                    const errText = await response.text();
                    console.error('Error de Ultramsg:', errText);
                    return { delivered: false, status: response.status, message: `Error de Ultramsg: ${errText}` };
                }
                return { delivered: true, status: response.status };
            }
            else {
                // Proveedor genérico / original
                const response = await fetch(env.WHATSAPP_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${env.WHATSAPP_API_TOKEN}`,
                    },
                    body: JSON.stringify({
                        to: normalizedPhone,
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
        catch (e) {
            console.error('Excepción al conectar con la pasarela de WhatsApp:', e);
            return { delivered: false, message: `Error de conexión con WhatsApp: ${e.message}` };
        }
    }
}
