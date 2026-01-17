import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  companyName: string;
  gstNumber: string;
  month: string;
  year: number;
  sellerName: string;
  categoryBreakdown: {
    name: string;
    pricePerPiece: number;
    quantity: number;
    subtotal: number;
  }[];
  grossAmount: number;
  totalReturns: number;
  totalReturnQty: number;
  netPayable: number;
}

export function generatePDF(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName, pageWidth / 2, 25, { align: 'center' });

  if (data.gstNumber) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`GST: ${data.gstNumber}`, pageWidth / 2, 32, { align: 'center' });
  }

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Billing Report', pageWidth / 2, 45, { align: 'center' });

  // Report info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${data.month} ${data.year}`, 14, 55);
  doc.text(`Seller: ${data.sellerName}`, 14, 62);

  // Category breakdown table
  const tableData = data.categoryBreakdown.map((cat) => [
    cat.name,
    `₹${cat.pricePerPiece.toLocaleString()}`,
    cat.quantity.toString(),
    `₹${cat.subtotal.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['Category', 'Price/Piece', 'Quantity', 'Subtotal']],
    body: tableData,
    foot: [['Total', '', data.categoryBreakdown.reduce((s, c) => s + c.quantity, 0).toString(), `₹${data.grossAmount.toLocaleString()}`]],
    theme: 'striped',
    headStyles: {
      fillColor: [33, 97, 198],
      textColor: 255,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Returns section
  if (data.totalReturns > 0) {
    doc.setFillColor(254, 226, 226);
    doc.rect(14, finalY, pageWidth - 28, 20, 'F');
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('Returns / Deductions', 20, finalY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.totalReturnQty} pieces returned`, 20, finalY + 15);
    doc.text(`-₹${data.totalReturns.toLocaleString()}`, pageWidth - 20, finalY + 12, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  // Net payable
  const netY = data.totalReturns > 0 ? finalY + 30 : finalY;
  doc.setFillColor(220, 252, 231);
  doc.rect(14, netY, pageWidth - 28, 20, 'F');
  doc.setTextColor(22, 163, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Net Payable Amount', 20, netY + 13);
  doc.setFontSize(14);
  doc.text(`₹${data.netPayable.toLocaleString()}`, pageWidth - 20, netY + 13, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, footerY);
  doc.text('Page 1 of 1', pageWidth - 14, footerY, { align: 'right' });

  // Save
  doc.save(`${data.companyName}_${data.sellerName}_${data.month}_${data.year}.pdf`);
}
