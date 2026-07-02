import PDFDocument from 'pdfkit';

export class PdfQuoteService {
  async buildQuotePdf(quote: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('Chichi Está de Fiesta', { align: 'center' });
      doc.fontSize(12).text('Cotización oficial FastKote', { align: 'center' });
      doc.moveDown();
      doc.fontSize(11).text(`Código: ${quote.code}`);
      doc.text(`Cliente: ${quote.client.fullName}`);
      doc.text(`Identificación: ${quote.client.identification}`);
      doc.text(`Fecha del evento: ${quote.eventDate.toISOString().slice(0, 10)}`);
      doc.text(`Estado: ${quote.status}`);
      doc.moveDown();

      doc.fontSize(13).text('Detalle de rubros', { underline: true });
      doc.moveDown(0.5);
      quote.items.forEach((item: any) => {
        doc.fontSize(10).text(`${item.description} | Cantidad: ${item.quantity} | P. Unitario: $${item.unitPrice} | Subtotal: $${item.subtotal}`);
      });

      doc.moveDown();
      doc.fontSize(11).text(`Subtotal: $${quote.subtotal}`);
      doc.text(`IVA: $${quote.tax}`);
      doc.text(`Descuento: $${quote.discount}`);
      doc.fontSize(14).text(`Total: $${quote.total}`, { align: 'right' });

      doc.moveDown(2);
      doc.fontSize(9).text('Condiciones legales:', { underline: true });
      doc.text('La validez de precios es de 15 días desde la emisión de la cotización.');
      doc.text('Este documento no constituye factura legal. La emisión de factura se realiza por los canales tributarios correspondientes.');
      doc.text('El tratamiento de datos personales se realiza con consentimiento del cliente y para fines comerciales relacionados con la cotización.');

      doc.end();
    });
  }
}
