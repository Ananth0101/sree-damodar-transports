import { jsPDF } from 'jspdf';
import { Consignment, COMPANY_INFO, CompanyType } from './types';

// Auto-select correct LR format based on company
export const generateLR = (consignment: Consignment): void => {
  if (consignment.company === 'traders') {
    generateTradersLR(consignment);
  } else {
    generateTransportsLR(consignment);
  }
};

// TRANSPORTS LR - Green format with 50 Years logo
export const generateTransportsLR = (consignment: Consignment): void => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const red: [number, number, number] = [200, 0, 0];
  const black: [number, number, number] = [0, 0, 0];
  const info = COMPANY_INFO.transports;

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
    catch { return ''; }
  };

  // Green background
  doc.setFillColor(210, 240, 210);
  doc.rect(0, 0, 297, 210, 'F');
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 287, 200);

  // Top text
  doc.setFontSize(8);
  doc.setTextColor(...red);
  doc.text('KINDLY INSURE YOUR GOODS FOR ANY CLAIMS', 80, 12);
  doc.text('SUBJECT TO BANGALORE JURISDICTION', 160, 12, { align: 'center' });
  doc.text(`${info.phone1} / ${info.phone2}`, 285, 12, { align: 'right' });

  // Main header
  const mainAreaCenter = (75 + 292) / 2;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...black);
  doc.text(info.name, mainAreaCenter, 25, { align: 'center' });
  doc.setFontSize(10);
  doc.text(info.address, mainAreaCenter, 32, { align: 'center' });

  // Left sidebar with 50 Years logo
  doc.setDrawColor(0, 0, 0);
  doc.rect(5, 5, 70, 200);
  doc.setFontSize(24);
  doc.text('S D T', 40, 25, { align: 'center' });
  doc.setLineWidth(0.2);
  doc.circle(40, 45, 15);
  doc.setFontSize(14);
  doc.text('50', 40, 43, { align: 'center' });
  doc.setFontSize(8);
  doc.text('YEARS', 40, 48, { align: 'center' });
  doc.text('Anniversary', 40, 55, { align: 'center' });
  doc.text('1969 - 2025', 40, 65, { align: 'center' });

  // Sidebar fields
  doc.setFontSize(9);
  let sideY = 85;
  const drawSideField = (label: string, value = '') => {
    doc.setFont('helvetica', 'bold'); doc.text(label, 10, sideY);
    doc.setFont('helvetica', 'normal'); if (value) doc.text(value, 10, sideY + 5);
    doc.line(10, sideY + 7, 65, sideY + 7); sideY += 15;
  };
  drawSideField('Value of Goods Rs.', consignment.value_of_goods || '');
  drawSideField('Invoice No. & Date', consignment.invoice_no_date || '');
  drawSideField('Delivery at :', consignment.delivery_at || '');
  drawSideField('Direct Unloading by Party');
  drawSideField('By Lorry No. :', consignment.vehicle_number || '');

  // Bank details
  const bankY = 175;
  doc.rect(5, bankY, 70, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(info.bankName, 10, bankY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(info.bankBranch, 10, bankY + 12);
  doc.text(`A/c No. ${info.accountNumber}`, 10, bankY + 17);
  doc.text(`IFSC Code : ${info.ifsc}`, 10, bankY + 22);

  // Consignment note box
  doc.rect(80, 40, 60, 25);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNMENT NOTE', 85, 45);
  doc.text('No.', 85, 55);
  doc.setTextColor(...red); doc.setFontSize(14);
  doc.text(consignment.consignment_no || '', 110, 55);
  doc.setTextColor(...black); doc.setFontSize(9);
  doc.text('DATE', 85, 62);
  doc.text(fmtDate(consignment.date), 105, 62);

  // AT OWNER'S RISK box
  doc.setTextColor(...red); doc.setFontSize(10);
  doc.text("AT OWNER'S RISK", 170, 45, { align: 'center' });
  doc.text('NOT RESPONSIBLE FOR', 170, 52, { align: 'center' });
  doc.text('LEAKAGE & DAMAGE', 170, 59, { align: 'center' });
  doc.text('GOODS COPY', 170, 68, { align: 'center' });
  doc.setTextColor(...black);

  // From/To boxes
  doc.rect(215, 42, 72, 12);
  doc.setFontSize(9);
  doc.text('From', 205, 50);
  doc.text(consignment.from_location || '', 220, 50);
  doc.rect(215, 60, 72, 12);
  doc.text('To', 205, 68);
  doc.text(consignment.to_location || '', 220, 68);

  // Consignor/Consignee
  doc.setFontSize(10);
  doc.text('Consignor', 80, 80);
  doc.text(consignment.customer_name || '', 100, 79);
  doc.text('Consignee', 185, 80);
  doc.text(consignment.consignee_name || '', 205, 79);
  doc.text('GST No.', 80, 95);
  doc.text(consignment.customer_gst || '', 100, 94);
  doc.text('GST No.', 185, 95);
  doc.text(consignment.consignee_gst || '', 205, 94);

  // Main table
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
  doc.text('C.R No.', 180, 195);
  doc.text('Date :', 180, 202);
  doc.setFont('helvetica', 'bold');
  doc.text('For SREE DAMODAR TRANSPORTS', 240, 190, { align: 'center' });
  doc.setFontSize(8);
  doc.text('BOOKING CLERK / MANAGER', 240, 202, { align: 'center' });

  doc.save(`LR_${consignment.consignment_no}_Transports.pdf`);
};

// TRADERS LR - White format with Ganesh logo and GST
export const generateTradersLR = (consignment: Consignment): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const black: [number, number, number] = [0, 0, 0];
  const red: [number, number, number] = [200, 0, 0];
  const info = COMPANY_INFO.traders;

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
    catch { return ''; }
  };

  // Border
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // Top section
  doc.setFontSize(8);
  doc.text('KINDLY INSURE YOUR', 50, 12);
  doc.text('GOODS FOR ANY CLAIMS', 50, 16);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT TO BANGALORE JURISDICTION', 105, 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`© ${info.phone1}`, 190, 14, { align: 'right' });

  // Ganesh logo placeholder (left side)
  doc.rect(10, 25, 25, 25);
  doc.setFontSize(10);
  doc.text('ॐ', 22, 40, { align: 'center' });

  // Main header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(info.name, 105, 35, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(info.address, 105, 42, { align: 'center' });

  // Consignment note box
  doc.rect(10, 55, 70, 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CONSIGNMENT NOTE', 15, 62);
  doc.setTextColor(...red);
  doc.setFontSize(16);
  doc.text('No.', 15, 70);
  doc.text(consignment.consignment_no || '', 50, 70, { align: 'center' });
  doc.setTextColor(...black);
  doc.setFontSize(9);
  doc.text(`DATE.......${fmtDate(consignment.date)}......202`, 15, 77);

  // Route box
  doc.rect(85, 55, 115, 15);
  doc.setFont('helvetica', 'bold');
  doc.text(info.route || '', 142, 62, { align: 'center' });
  doc.text(info.service || '', 142, 68, { align: 'center' });

  // From/To
  doc.rect(85, 70, 57, 10);
  doc.text('From', 90, 77);
  doc.setFont('helvetica', 'normal');
  doc.text(consignment.from_location || '', 105, 77);

  doc.rect(143, 70, 57, 10);
  doc.setFont('helvetica', 'bold');
  doc.text('To', 148, 77);
  doc.setFont('helvetica', 'normal');
  doc.text(consignment.to_location || '', 160, 77);

  // AT OWNER'S RISK box
  doc.setTextColor(...red);
  doc.setFont('helvetica', 'bold');
  doc.text("AT OWNER'S RISK", 142, 87, { align: 'center' });
  doc.text('NOT RESPONSIBLE FOR', 142, 93, { align: 'center' });
  doc.text('LEAKAGE & DAMAGE', 142, 99, { align: 'center' });
  doc.setTextColor(...black);

  // Left sidebar
  doc.setFontSize(8);
  doc.text('Value of', 10, 90);
  doc.text('Goods ₹', 10, 95);
  doc.line(10, 97, 75, 97);
  doc.text(consignment.value_of_goods || '', 15, 102);

  doc.text('Invoice No.', 10, 110);
  doc.line(10, 112, 75, 112);
  doc.text(consignment.invoice_no_date || '', 15, 117);

  doc.text('& Date', 10, 125);
  doc.line(10, 127, 75, 127);

  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN :', 10, 140);
  doc.setFont('helvetica', 'normal');
  doc.text(info.gstin, 10, 145);

  doc.text('Direct Unloading by Party', 10, 160);
  doc.line(10, 162, 75, 162);

  doc.text('By Lorry No. :', 10, 175);
  doc.line(10, 177, 75, 177);
  doc.text(consignment.vehicle_number || '', 15, 182);

  // Bank details
  doc.rect(10, 235, 75, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(info.bankName, 15, 242);
  doc.setFont('helvetica', 'normal');
  doc.text(info.bankBranch, 15, 247);
  doc.text(`A/c No. ${info.accountNumber}`, 15, 252);
  doc.text(`IFSC Code : ${info.ifsc}`, 15, 257);

  // Consignor/Consignee
  doc.setFontSize(9);
  doc.text('Consignor', 10, 110);
  doc.text(consignment.customer_name || '', 40, 110);
  doc.text('Consignee', 120, 110);
  doc.text(consignment.consignee_name || '', 150, 110);

  doc.text('GST No.', 10, 120);
  doc.text(consignment.customer_gst || '', 40, 120);
  doc.text('GST No.', 120, 120);
  doc.text(consignment.consignee_gst || '', 150, 120);

  // Main table
  const tableY = 130;
  doc.rect(10, tableY, 190, 100);
  
  // Table headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('No. of', 12, tableY + 5);
  doc.text('Articles', 12, tableY + 9);
  doc.rect(10, tableY, 20, 100);
  
  doc.text('Nature of Goods said to contain', 60, tableY + 7);
  doc.rect(30, tableY, 70, 100);
  
  doc.text('Actual', 105, tableY + 5);
  doc.text('Weight', 105, tableY + 9);
  doc.rect(100, tableY, 20, 100);
  
  doc.text('Charged', 125, tableY + 5);
  doc.text('Weight', 125, tableY + 9);
  doc.rect(120, tableY, 20, 100);
  
  doc.text('FREIGHT AMOUNT', 160, tableY + 7);
  doc.rect(140, tableY, 60, 15);
  
  // PAID / TO-PAY headers
  doc.line(140, tableY + 15, 200, tableY + 15);
  doc.text('PAID', 155, tableY + 20);
  doc.text('TO-PAY', 180, tableY + 20);
  doc.line(170, tableY + 15, 170, tableY + 100);
  
  doc.text('Rs.', 145, tableY + 28);
  doc.text('P.', 165, tableY + 28);
  doc.text('Rs.', 175, tableY + 28);
  doc.text('P.', 195, tableY + 28);

  // Data
  doc.setFont('helvetica', 'normal');
  doc.text(consignment.articles_count || '1', 15, tableY + 20);
  doc.text(consignment.goods_description || '', 35, tableY + 20);
  doc.text(consignment.weight || '', 105, tableY + 20);
  doc.text(consignment.charged_weight || consignment.weight || '', 125, tableY + 20);

  // Freight rows
  let rowY = tableY + 40;
  const drawRow = (label: string, val: number) => {
    doc.line(140, rowY, 200, rowY);
    doc.setFont('helvetica', 'bold');
    doc.text(label, 138, rowY - 2, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(String(val), 175, rowY - 2);
    rowY += 8;
  };

  drawRow('Rate', consignment.freight_amount || 0);
  drawRow('Handling', consignment.handling_charges || 0);
  drawRow('Halting', consignment.halting_charges || 0);
  
  // GST rows
  doc.line(140, rowY, 200, rowY);
  doc.setFont('helvetica', 'bold');
  doc.text('SGST', 138, rowY - 2, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(String(consignment.sgst || 0), 175, rowY - 2);
  rowY += 8;

  doc.line(140, rowY, 200, rowY);
  doc.setFont('helvetica', 'bold');
  doc.text('CGST', 138, rowY - 2, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(String(consignment.cgst || 0), 175, rowY - 2);
  rowY += 8;

  // Grand Total
  const grandTotal = (consignment.freight_amount || 0) + 
                     (consignment.handling_charges || 0) + 
                     (consignment.halting_charges || 0) +
                     (consignment.sgst || 0) +
                     (consignment.cgst || 0);
  
  doc.line(140, rowY, 200, rowY);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total', 138, rowY - 2, { align: 'right' });
  doc.text(String(grandTotal), 175, rowY - 2);

  // Bottom text
  doc.setFontSize(7);
  doc.text('GST Paid by Party\'s Consignor/Consignee', 10, tableY + 105);
  
  doc.setFontSize(8);
  doc.text('Declaration:', 10, tableY + 115);
  doc.text('Pay GST 5% on your GST Number', 10, tableY + 120);
  doc.text('legal services chargeable on reverse charge', 10, tableY + 125);
  doc.text('basis payable by recipient of services', 10, tableY + 130);
  doc.text('notification no 13/2017/28/62017', 10, tableY + 135);

  doc.setFont('helvetica', 'bold');
  doc.text('For SREE DAMODAR TRADERS', 150, tableY + 125, { align: 'center' });
  doc.setFontSize(7);
  doc.text('BOOKING CLERK / MANAGER', 150, tableY + 135, { align: 'center' });

  doc.save(`LR_${consignment.consignment_no}_Traders.pdf`);
};
