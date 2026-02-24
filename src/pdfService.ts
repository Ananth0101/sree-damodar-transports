import { jsPDF } from 'jspdf';
import { Consignment, BANK_DETAILS } from './types';

export const generateLR = (consignment: Consignment): void => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const red: [number, number, number] = [200, 0, 0];
  const black: [number, number, number] = [0, 0, 0];

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' }); }
    catch { return ''; }
  };

  doc.setFillColor(210, 240, 210);
  doc.rect(0, 0, 297, 210, 'F');
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 287, 200);

  doc.setFontSize(8);
  doc.setTextColor(...red);
  doc.text('KINDLY INSURE YOUR GOODS FOR ANY CLAIMS', 80, 12);
  doc.text('SUBJECT TO BANGALORE JURISDICTION', 160, 12, { align: 'center' });
  doc.text('9880525597 / 8618422012', 285, 12, { align: 'right' });

  const mainAreaCenter = (75 + 292) / 2;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...black);
  doc.text('SREE DAMODAR TRANSPORTS', mainAreaCenter, 25, { align: 'center' });
  doc.setFontSize(10);
  doc.text('H.O. : 4th Main Road, New Tharagupet, Bangalore - 560 002', mainAreaCenter, 32, { align: 'center' });

  doc.setDrawColor(0, 0, 0);
  doc.rect(5, 5, 70, 200);
  doc.setFontSize(24);
  doc.text('S D T', 35, 25, { align: 'center' });
  doc.setLineWidth(0.2);
  doc.circle(35, 45, 15);
  doc.setFontSize(14);
  doc.text('50', 35, 43, { align: 'center' });
  doc.setFontSize(8);
  doc.text('YEARS', 35, 48, { align: 'center' });
  doc.text('Anniversary', 35, 55, { align: 'center' });
  doc.text('1969 - 2025', 35, 65, { align: 'center' });

  doc.setFontSize(9);
  let sideY = 85;
  const drawSideField = (label: string, value = '') => {
    doc.setFont('helvetica', 'bold'); doc.text(label, 10, sideY);
    doc.setFont('helvetica', 'normal'); doc.text(value, 40, sideY);
    doc.line(10, sideY + 2, 65, sideY + 2); sideY += 12;
  };
  drawSideField('Value of Goods Rs.', consignment.value_of_goods || '');
  drawSideField('Invoice No. & Date', consignment.invoice_no_date || '');
  drawSideField('Delivery at :', consignment.delivery_at || '');
  drawSideField('Direct Unloading by Party', '');
  drawSideField('By Lorry No. :', consignment.vehicle_number || '');

  const bankY = 175;
  doc.rect(5, bankY, 70, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(BANK_DETAILS.bankName, 10, bankY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(BANK_DETAILS.branch, 10, bankY + 12);
  doc.text(`A/c No. ${BANK_DETAILS.accountNumber}`, 10, bankY + 17);
  doc.text(`IFSC Code : ${BANK_DETAILS.ifsc}`, 10, bankY + 22);

  doc.rect(80, 40, 60, 25);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNMENT NOTE', 85, 45);
  doc.text('No.', 85, 55);
  doc.setTextColor(...red); doc.setFontSize(14);
  doc.text(consignment.consignment_no || '', 110, 55);
  doc.setTextColor(...black); doc.setFontSize(9);
  doc.text('DATE ......................... 202', 85, 62);
  doc.text(fmtDate(consignment.date), 100, 61);

  doc.setTextColor(...red); doc.setFontSize(10);
  doc.text("AT OWNER'S RISK", 170, 45, { align: 'center' });
  doc.text('NOT RESPONSIBLE FOR', 170, 52, { align: 'center' });
  doc.text('LEAKAGE & DAMAGE', 170, 59, { align: 'center' });
  doc.text('GOODS COPY', 170, 68, { align: 'center' });
  doc.setTextColor(...black);

  doc.rect(215, 42, 72, 12);
  doc.text('From', 205, 50);
  doc.text(consignment.from_location || '', 220, 50);
  doc.rect(215, 60, 72, 12);
  doc.text('To', 205, 68);
  doc.text(consignment.to_location || '', 220, 68);

  doc.setFontSize(10);
  doc.text('Consignor .................................................................................', 80, 80);
  doc.text(consignment.customer_name || '', 100, 79);
  doc.text('Consignee .................................................................................', 185, 80);
  doc.text(consignment.consignee_name || '', 205, 79);
  doc.text('GST No. .................................................................................', 80, 95);
  doc.text(consignment.customer_gst || '', 100, 94);
  doc.text('GST No. .................................................................................', 185, 95);
  doc.text(consignment.consignee_gst || '', 205, 94);

  const tableY = 100;
  doc.setLineWidth(0.3);
  doc.rect(80, tableY, 212, 85);
  doc.line(100, tableY, 100, tableY + 85);
  doc.line(185, tableY, 185, tableY + 85);
  doc.line(200, tableY, 200, tableY + 15);
  doc.line(215, tableY, 215, tableY + 85);
  doc.line(215, tableY + 15, 292, tableY + 15);
  doc.line(250, tableY + 15, 250, tableY + 85);
  doc.line(235, tableY + 22, 235, tableY + 85);
  doc.line(275, tableY + 22, 275, tableY + 85);

  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('No. of', 82, tableY + 5); doc.text('Articles', 82, tableY + 10);
  doc.text('Nature of Goods said to contain', 110, tableY + 8);
  doc.text('Actual', 187, tableY + 5); doc.text('Weight', 187, tableY + 10);
  doc.text('Charged', 202, tableY + 5); doc.text('Weight', 202, tableY + 10);
  doc.text('FREIGHT AMOUNT', 240, tableY + 10);
  doc.text('PAID', 225, tableY + 20); doc.text('TO-PAY', 265, tableY + 20);
  doc.text('Rs.', 220, tableY + 28); doc.text('P.', 240, tableY + 28);
  doc.text('Rs.', 255, tableY + 28); doc.text('P.', 280, tableY + 28);

  doc.setFont('helvetica', 'normal');
  doc.text(consignment.articles_count || '1', 85, tableY + 25);
  doc.text(consignment.goods_description || '', 105, tableY + 25);
  doc.text(consignment.weight || '', 187, tableY + 25);
  doc.text(consignment.charged_weight || consignment.weight || '', 202, tableY + 25);

  const drawFreightRow = (label: string, paidVal: string, toPayVal: string, y: number) => {
    doc.line(215, y, 292, y);
    doc.setFont('helvetica', 'bold'); doc.text(label, 213, y - 3, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    if (paidVal) doc.text(paidVal, 220, y - 3);
    if (toPayVal) doc.text(toPayVal, 255, y - 3);
  };

  let freightY = tableY + 40;
  drawFreightRow('Rate', '', String(consignment.freight_amount || 0), freightY); freightY += 8;
  drawFreightRow('Handling', '', String(consignment.handling_charges || 0), freightY); freightY += 8;
  drawFreightRow('Halting', '', String(consignment.halting_charges || 0), freightY); freightY += 8;
  drawFreightRow('Advance', String(consignment.advance_paid || 0), '', freightY); freightY += 8;
  drawFreightRow('G.C. Charge', '', String(consignment.gc_charges || 0), freightY); freightY += 8;
  drawFreightRow('TOTAL', '', String(consignment.balance_amount || 0), freightY);

  doc.setTextColor(...red); doc.setFontSize(9);
  doc.text('Service Tax to be Paid by Consignor / Consignee', 120, 190, { align: 'center' });
  doc.setTextColor(...black);
  doc.text('C.R No. .........................', 180, 195);
  doc.text('Date : .........................', 180, 202);
  doc.setFont('helvetica', 'bold');
  doc.text('For SREE DAMODAR TRANSPORTS', 240, 190, { align: 'center' });
  doc.setFontSize(8);
  doc.text('BOOKING CLERK / MANAGER', 240, 202, { align: 'center' });

  doc.save(`LR_${consignment.consignment_no}.pdf`);
};
