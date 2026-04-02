import jsPDF from 'jspdf';
import { Claim } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function generateClaimPDF(claim: Claim) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('ClaimPath — Documento Legal', margin, y);
  doc.text(format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es }), pageWidth - margin, y, { align: 'right' });
  y += 5;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(claim.title || 'Documento de Reclamación', maxWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 10;

  // Document body
  if (claim.generated_document) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(claim.generated_document, maxWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 6;
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'Generado por ClaimPath — Este documento es orientativo y no reemplaza la consulta con un abogado.',
      pageWidth / 2,
      285,
      { align: 'center' }
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 285, { align: 'right' });
  }

  doc.save(`${claim.title || 'reclamacion'}.pdf`);
}
