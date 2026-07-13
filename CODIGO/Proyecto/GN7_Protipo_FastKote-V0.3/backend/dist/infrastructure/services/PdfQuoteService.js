import PDFDocument from 'pdfkit';
import { prisma } from '../../shared/prisma/prisma.js';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.resolve(__dirname, '../../assets/logo.png');
export class PdfQuoteService {
    async buildQuotePdf(quote) {
        // Fetch package details to show precise calculation breakdown if applicable
        let packageRecord = null;
        if (quote.packageId) {
            try {
                packageRecord = await prisma.catalogPackage.findUnique({
                    where: { id: quote.packageId }
                });
            }
            catch (err) {
                console.error("Error fetching package details for PDF:", err);
            }
        }
        return new Promise((resolve) => {
            const doc = new PDFDocument({ size: 'A4', margin: 48 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            // Style Color Palette
            const primaryColor = '#4c1d95'; // Deep royal purple
            const darkText = '#1f2937'; // Charcoal
            const greyText = '#4b5563'; // Cool grey
            const lightBg = '#f5f3ff'; // Light lavender
            const borderLavender = '#e0e7ff'; // Indigo border
            // Top accent strip
            doc.rect(48, 36, 500, 6).fill(primaryColor);
            // Document Header Logo
            try {
                doc.image(logoPath, 48, 48, { height: 42 });
            }
            catch (err) {
                doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('CHICHI ESTÁ DE FIESTA', 48, 56);
            }
            doc.fillColor(greyText).fontSize(8.5).font('Helvetica').text('Servicios de Eventos & Entretenimiento Infantil', 48, 92);
            doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold').text('COTIZACIÓN', 350, 56, { align: 'right', width: 200 });
            doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text(`Código: ${quote.code}`, 350, 80, { align: 'right', width: 200 });
            // Decorative divider
            doc.moveTo(48, 108).lineTo(548, 108).strokeColor('#e5e7eb').lineWidth(1).stroke();
            // Column 1: Client Metadata
            doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('DATOS DEL CLIENTE', 48, 120);
            doc.fillColor(darkText).fontSize(9).font('Helvetica-Bold').text('Cliente:', 48, 138).font('Helvetica').text(quote.client.fullName, 110, 138);
            doc.font('Helvetica-Bold').text('Identificación:', 48, 153).font('Helvetica').text(quote.client.identification, 110, 153);
            doc.font('Helvetica-Bold').text('Email:', 48, 168).font('Helvetica').text(quote.client.email || '-', 110, 168);
            doc.font('Helvetica-Bold').text('Teléfono:', 48, 183).font('Helvetica').text(quote.client.phone || '-', 110, 183);
            // Column 2: Quote & Event Metadata
            doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('DETALLES DEL EVENTO', 320, 120);
            doc.fillColor(darkText).fontSize(9).font('Helvetica-Bold').text('Tipo de Evento:', 320, 138).font('Helvetica').text(quote.eventType, 420, 138);
            doc.font('Helvetica-Bold').text('Fecha Evento:', 320, 153).font('Helvetica').text(quote.eventDate.toISOString().slice(0, 10), 420, 153);
            doc.font('Helvetica-Bold').text('Emisión:', 320, 168).font('Helvetica').text(quote.createdAt ? quote.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10), 420, 168);
            doc.font('Helvetica-Bold').text('Válido Hasta:', 320, 183).font('Helvetica').text(quote.validUntil ? quote.validUntil.toISOString().slice(0, 10) : '-', 420, 183);
            // Pricing Explanation Section (Memoria de Cálculo)
            let startYTable = 290;
            if (packageRecord) {
                doc.roundedRect(48, 205, 500, 65, 8).fillAndStroke(lightBg, borderLavender).lineWidth(1);
                doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('MEMORIA DE CÁLCULO DE PRECIO', 60, 215);
                doc.fillColor(darkText).fontSize(9).font('Helvetica-Bold').text('Paquete comercial:', 60, 230).font('Helvetica').text(packageRecord.name, 170, 230);
                if (packageRecord.pricePerChild && Number(packageRecord.pricePerChild) > 0) {
                    const children = quote.childrenCount || 0;
                    const minChildren = packageRecord.minChildren || 0;
                    const finalChildrenCount = Math.max(children, minChildren);
                    doc.font('Helvetica-Bold').text('Estrategia de precio:', 60, 245).font('Helvetica').text(`Por niño ($${Number(packageRecord.pricePerChild).toFixed(2)} / niño)`, 170, 245);
                    let breakdownDesc = `${children} niños cotizados.`;
                    if (children < minChildren) {
                        breakdownDesc += ` (Aplica cargo mínimo contractual de ${minChildren} niños).`;
                    }
                    doc.font('Helvetica-Bold').text('Detalle de cobro:', 60, 256).font('Helvetica').text(`${breakdownDesc} Total base: $${Number(packageRecord.pricePerChild).toFixed(2)} x ${finalChildrenCount} = $${(Number(packageRecord.pricePerChild) * finalChildrenCount).toFixed(2)}`, 170, 256);
                }
                else {
                    doc.font('Helvetica-Bold').text('Estrategia de precio:', 60, 245).font('Helvetica').text('Precio fijo base + insumos y servicios adicionales', 170, 245);
                    doc.font('Helvetica-Bold').text('Detalle de cobro:', 60, 256).font('Helvetica').text(`Precio mínimo base: $${Number(packageRecord.minPrice).toFixed(2)} | Margen de paquete: ${packageRecord.marginPercent}%`, 170, 256);
                }
                startYTable = 285;
            }
            else {
                doc.roundedRect(48, 205, 500, 45, 8).fillAndStroke(lightBg, borderLavender).lineWidth(1);
                doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('MEMORIA DE CÁLCULO DE PRECIO', 60, 215);
                doc.fillColor(darkText).fontSize(9).font('Helvetica-Bold').text('Estrategia de precio:', 60, 230).font('Helvetica').text('Cotización personalizada según catálogo comercial independiente.', 170, 230);
                startYTable = 265;
            }
            // Table Header
            const tableTop = startYTable + 10;
            doc.rect(48, tableTop, 500, 20).fill(primaryColor);
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
            doc.text('Descripción / Rubro', 56, tableTop + 6, { width: 230 });
            doc.text('Cant.', 296, tableTop + 6, { width: 50, align: 'center' });
            doc.text('P. Unitario', 356, tableTop + 6, { width: 80, align: 'right' });
            doc.text('Subtotal', 446, tableTop + 6, { width: 90, align: 'right' });
            // Table Rows
            let currentY = tableTop + 20;
            doc.font('Helvetica').fontSize(9).fillColor(darkText);
            (quote.items || []).forEach((item, index) => {
                // Zebra striping
                if (index % 2 === 1) {
                    doc.rect(48, currentY, 500, 18).fill('#f9fafb');
                }
                doc.fillColor(darkText);
                doc.text(item.description, 56, currentY + 5, { width: 230, height: 12, ellipsis: true });
                doc.text(item.quantity.toString(), 296, currentY + 5, { width: 50, align: 'center' });
                doc.text(`$${Number(item.unitPrice).toFixed(2)}`, 356, currentY + 5, { width: 80, align: 'right' });
                doc.text(`$${Number(item.subtotal).toFixed(2)}`, 446, currentY + 5, { width: 90, align: 'right' });
                // Row bottom outline
                doc.moveTo(48, currentY + 18).lineTo(548, currentY + 18).strokeColor('#f3f4f6').lineWidth(1).stroke();
                currentY += 18;
            });
            // Price Totals Summary
            const summaryY = currentY + 15;
            doc.fillColor(darkText).font('Helvetica');
            doc.text('Subtotal:', 340, summaryY, { width: 100, align: 'right' });
            doc.font('Helvetica-Bold').text(`$${Number(quote.subtotal).toFixed(2)}`, 450, summaryY, { width: 90, align: 'right' });
            doc.font('Helvetica').text('Descuento:', 340, summaryY + 15, { width: 100, align: 'right' });
            doc.font('Helvetica-Bold').text(`-$${Number(quote.discount).toFixed(2)}`, 450, summaryY + 15, { width: 90, align: 'right' });
            doc.font('Helvetica').text('IVA (15%):', 340, summaryY + 30, { width: 100, align: 'right' });
            doc.font('Helvetica-Bold').text(`$${Number(quote.tax).toFixed(2)}`, 450, summaryY + 30, { width: 90, align: 'right' });
            // Total Box Display
            doc.roundedRect(330, summaryY + 48, 218, 28, 6).fill(lightBg);
            doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold');
            doc.text('TOTAL COTIZADO:', 340, summaryY + 57, { width: 110 });
            doc.text(`$${Number(quote.total).toFixed(2)}`, 446, summaryY + 57, { width: 90, align: 'right' });
            // Notes and Observations
            if (quote.notes) {
                doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Notas y observaciones:', 48, summaryY + 95);
                doc.fillColor(greyText).fontSize(8.5).font('Helvetica-Oblique').text(quote.notes, 48, summaryY + 110, { width: 500 });
            }
            // Page Footer with Legal Terms
            const footerY = 700;
            doc.moveTo(48, footerY).lineTo(548, footerY).strokeColor(borderLavender).lineWidth(1.5).stroke();
            doc.fillColor(greyText).fontSize(7.5).font('Helvetica').text('Términos y condiciones comerciales:', 48, footerY + 8, { underline: true });
            doc.text('• La validez de los precios es de 15 días calendario a partir de la emisión de la presente cotización.', 48, footerY + 18);
            doc.text('• Se requiere abono del 50% para reserva de fecha de agenda; saldo liquidado al inicio del evento.', 48, footerY + 28);
            doc.text('• Protección de Datos (LOPDP): Tratamiento exclusivo de información personal con fines contractuales y comerciales.', 48, footerY + 38);
            doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primaryColor).text('Chichi Está de Fiesta · Gestión de Eventos Profesionales', 48, footerY + 52, { align: 'center', width: 500 });
            doc.end();
        });
    }
}
