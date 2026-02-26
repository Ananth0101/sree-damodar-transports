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

// TRANSPORTS LR - Green format with 50 Years logo (FIXED)
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
  
  // Outer border
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 287, 200);

  // Top text - FIXED positioning to avoid overlap
  doc.setFontSize(7);
  doc.setTextColor(...red);
  doc.text('KINDLY INSURE YOUR GOODS FOR ANY CLAIMS', 78, 10);
  doc.text('SUBJECT TO BANGALORE JURISDICTION', 165, 10);
  doc.text(`${info.phone1} / ${info.phone2}`, 285, 10, { align: 'right' });

  // Main header
  const mainAreaCenter = (75 + 292) / 2;
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...black);
  doc.text(info.name, mainAreaCenter, 23, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(info.address, mainAreaCenter, 30, { align: 'center' });

  // Left sidebar
  doc.setDrawColor(0, 0, 0);
  doc.rect(5, 5, 70, 200);
  
  // 50 Years logo
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('S D T', 40, 23, { align: 'center' });
  doc.setLineWidth(0.3);
  doc.circle(40, 43, 14);
  doc.setFontSize(16);
  doc.text('50', 40, 42, { align: 'center' });
  doc.setFontSize(7);
  doc.text('YEARS', 40, 47, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Anniversary', 40, 53, { align: 'center' });
  doc.text('1969 - 2025', 40, 61, { align: 'center' });

  // Sidebar fields
  doc.setFontSize(8);
  let sideY = 80;
  const drawSideField = (label: string, value = '') => {
    doc.setFont('helvetica', 'bold'); 
    doc.text(label, 10, sideY);
    doc.setFont('helvetica', 'normal');
    if (value) doc.text(value, 10, sideY + 4);
    doc.line(10, sideY + 6, 65, sideY + 6); 
    sideY += 13;
  };
  
  drawSideField('Value of Goods Rs.', consignment.value_of_goods || '');
  drawSideField('Invoice No. & Date', consignment.invoice_no_date || '');
  drawSideField('Delivery at :', consignment.delivery_at || '');
  drawSideField('Direct Unloading by Party');
  drawSideField('By Lorry No. :', consignment.vehicle_number || '');

  // Bank details
  const bankY = 172;
  doc.rect(5, bankY, 70, 33);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(info.bankName, 10, bankY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(info.bankBranch, 10, bankY + 11);
  doc.text(`A/c No. ${info.accountNumber}`, 10, bankY + 16);
  doc.text(`IFSC Code : ${info.ifsc}`, 10, bankY + 21);

  // Consignment note box
  doc.rect(78, 38, 58, 24);
  doc.setFontSize(9); 
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNMENT NOTE', 81, 43);
  doc.setFontSize(8);
  doc.text('No.', 81, 51);
  doc.setTextColor(...red); 
  doc.setFontSize(16);
  doc.text(consignment.consignment_no || '', 105, 52);
  doc.setTextColor(...black); 
  doc.setFontSize(8);
  doc.text('DATE', 81, 58);
  doc.text(fmtDate(consignment.date), 98, 58);

  // AT OWNER'S RISK box
  doc.setTextColor(...red); 
  doc.setFontSize(9);
  doc.text("AT OWNER'S RISK", 168, 43, { align: 'center' });
  doc.text('NOT RESPONSIBLE FOR', 168, 49, { align: 'center' });
  doc.text('LEAKAGE & DAMAGE', 168, 55, { align: 'center' });
  doc.setFontSize(10);
  doc.text('GOODS COPY', 168, 62, { align: 'center' });
  doc.setTextColor(...black);

  // From/To boxes
  doc.rect(213, 40, 74, 11);
  doc.setFontSize(8);
  doc.text('From', 206, 47);
  doc.text(consignment.from_location || '', 218, 47);
  
  doc.rect(213, 58, 74, 11);
  doc.text('To', 206, 65);
  doc.text(consignment.to_location || '', 218, 65);

  // Consignor/Consignee section
  doc.setFontSize(9);
  doc.text('Consignor', 78, 77);
  doc.text(consignment.customer_name || '', 105, 77);
  doc.text('Consignee', 183, 77);
  doc.text(consignment.consignee_name || '', 210, 77);
  
  doc.text('GST No.', 78, 88);
  doc.text(consignment.customer_gst || '', 105, 88);
  doc.text('GST No.', 183, 88);
  doc.text(consignment.consignee_gst || '', 210, 88);

  // Main table - FIXED column widths
  const tableY = 94;
  doc.setLineWidth(0.3);
  doc.rect(78, tableY, 214, 90);
  
  // Vertical lines - FIXED spacing
  doc.line(98, tableY, 98, tableY + 90);   // No. of Articles
  doc.line(178, tableY, 178, tableY + 90); // Nature of goods
  doc.line(198, tableY, 198, tableY + 90); // Actual Weight - FIXED
  doc.line(218, tableY, 218, tableY + 90); // Charged Weight - FIXED
  
  // Freight section
  doc.line(218, tableY + 15, 292, tableY + 15);
  doc.line(253, tableY + 15, 253, tableY + 90);
  doc.line(238, tableY + 22, 238, tableY + 90);
  doc.line(278, tableY + 22, 278, tableY + 90);

  // Table headers
  doc.setFontSize(7); 
  doc.setFont('helvetica', 'bold');
  doc.text('No. of', 80, tableY + 4);
  doc.text('Articles', 80, tableY + 8);
  
  doc.text('Nature of Goods said to contain', 115, tableY + 6);
  
  doc.text('Actual', 183, tableY + 4);
  doc.text('Weight', 183, tableY + 8);
  
  doc.text('Charged', 203, tableY + 4);
  doc.text('Weight', 203, tableY + 8);
  
  doc.text('FREIGHT AMOUNT', 245, tableY + 9);
  doc.text('PAID', 228, tableY + 19);
  doc.text('TO-PAY', 268, tableY + 19);
  doc.text('Rs.', 223, tableY + 26);
  doc.text('P.', 243, tableY + 26);
  doc.text('Rs.', 258, tableY + 26);
  doc.text('P.', 283, tableY + 26);

  // Data rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(consignment.articles_count || '1', 83, tableY + 20);
  doc.text(consignment.goods_description || '', 100, tableY + 20);
  doc.text(consignment.weight || '', 183, tableY + 20);
  doc.text(consignment.charged_weight || consignment.weight || '', 203, tableY + 20);

  // Freight rows
  const drawFreightRow = (label: string, paidVal: string, toPayVal: string, y: number) => {
    doc.line(218, y, 292, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(label, 216, y - 2, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (paidVal) doc.text(paidVal, 223, y - 2);
    if (toPayVal) doc.text(toPayVal, 258, y - 2);
  };

  let freightY = tableY + 38;
  drawFreightRow('Rate', '', String(consignment.freight_amount || 0), freightY); 
  freightY += 8;
  drawFreightRow('Handling', '', String(consignment.handling_charges || 0), freightY); 
  freightY += 8;
  drawFreightRow('Halting', '', String(consignment.halting_charges || 0), freightY); 
  freightY += 8;
  drawFreightRow('Advance', String(consignment.advance_paid || 0), '', freightY); 
  freightY += 8;
  drawFreightRow('G.C. Charge', '', String(consignment.gc_charges || 0), freightY); 
  freightY += 8;
  drawFreightRow('TOTAL', '', String(consignment.balance_amount || 0), freightY);

  // Bottom section
  doc.setTextColor(...red); 
  doc.setFontSize(8);
  doc.text('Service Tax to be Paid by Consignor / Consignee', 115, 190, { align: 'center' });
  doc.setTextColor(...black);
  doc.setFontSize(8);
  doc.text('C.R No.', 178, 192);
  doc.text('Date :', 178, 199);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('For SREE DAMODAR TRANSPORTS', 245, 190, { align: 'center' });
  doc.setFontSize(7);
  doc.text('BOOKING CLERK / MANAGER', 245, 199, { align: 'center' });

  doc.save(`LR_${consignment.consignment_no}_Transports.pdf`);
};

// TRADERS LR - Portrait format (FIXED to match your image)
export const generateTradersLR = (consignment: Consignment): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const black: [number, number, number] = [0, 0, 0];
  const red: [number, number, number] = [200, 0, 0];
  const info = COMPANY_INFO.traders;

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return ''; }
  };

  // Border
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  // Top section
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('KINDLY INSURE YOUR', 15, 16);
  doc.text('GOODS FOR ANY CLAIMS', 15, 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT TO BANGALORE JURISDICTION', 105, 18, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`© ${info.phone1}`, 195, 18, { align: 'right' });

  // Left box for Ganesh logo placeholder
  doc.rect(15, 28, 30, 30);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('ॐ', 30, 48, { align: 'center' });
  doc.setFontSize(6);
  doc.text('P', 30, 54, { align: 'center' });

  // Main header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(info.name, 105, 38, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(info.address, 105, 45, { align: 'center' });

  // Consignment note box
  doc.rect(15, 63, 70, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONSIGNMENT NOTE', 20, 69);
  doc.setFontSize(8);
  doc.setTextColor(...red);
  doc.text('No.', 20, 77);
  doc.setFontSize(14);
  doc.text(consignment.consignment_no || '', 35, 78);
  doc.setTextColor(...black);
  doc.setFontSize(8);
  doc.text(`DATE.......${fmtDate(consignment.date)}......202`, 20, 86);

  // Route and service box
  doc.rect(90, 63, 110, 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(info.route || 'BANGALORE - MANGALORE', 145, 70, { align: 'center' });
  doc.text(info.service || 'DAILY PARCELS SERVICE', 145, 75, { align: 'center' });

  // From/To boxes
  doc.rect(90, 76, 55, 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('From', 93, 84);
  doc.setFont('helvetica', 'normal');
  doc.text(consignment.from_location || '', 110, 84);

  doc.rect(145, 76, 55, 13);
  doc.setFont('helvetica', 'bold');
  doc.text('To', 148, 84);
  doc.setFont('helvetica', 'normal');
  doc.text(consignment.to_location || '', 160, 84);

  // AT OWNER'S RISK
  doc.setTextColor(...red);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("AT OWNER'S RISK", 145, 98, { align: 'center' });
  doc.text('NOT RESPONSIBLE FOR', 145, 103, { align: 'center' });
  doc.text('LEAKAGE & DAMAGE', 145, 108, { align: 'center' });
  doc.setTextColor(...black);

  // Left sidebar fields
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Value of', 15, 96);
  doc.text('Goods ₹', 15, 100);
  doc.line(15, 102, 80, 102);
  doc.text(consignment.value_of_goods || '', 20, 107);

  doc.text('Invoice No.', 15, 116);
  doc.line(15, 118, 80, 118);

  doc.text('& Date', 15, 126);
  doc.line(15, 128, 80, 128);
  doc.text(consignment.invoice_no_date || '', 20, 133);

  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN :', 15, 142);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(info.gstin, 15, 147);

  doc.setFontSize(8);
  doc.text('Direct Unloading by Party', 15, 158);
  doc.line(15, 160, 80, 160);

  doc.text('By Lorry No. :', 15, 170);
  doc.line(15, 172, 80, 172);
  doc.text(consignment.vehicle_number || '', 20, 177);

  // Consignor/Consignee
  doc.setFontSize(8);
  doc.text('Consignor', 15, 190);
  doc.text(consignment.customer_name || '', 45, 190);

  doc.text('Consignee', 115, 190);
  doc.text(consignment.consignee_name || '', 145, 190);

  doc.text('GST No.', 15, 200);
  doc.text(consignment.customer_gst || '', 45, 200);

  doc.text('GST No.', 115, 200);
  doc.text(consignment.consignee_gst || '', 145, 200);

  // Main table
  const tableY = 207;
  doc.rect(15, tableY, 185, 60);

  // Column lines
  doc.line(30, tableY, 30, tableY + 60);  // No. of Articles
  doc.line(95, tableY, 95, tableY + 60);  // Nature of goods
  doc.line(115, tableY, 115, tableY + 60); // Actual weight
  doc.line(135, tableY, 135, tableY + 60); // Charged weight
  
  // Freight section
  doc.line(135, tableY + 12, 200, tableY + 12);
  doc.line(167, tableY + 12, 167, tableY + 60);
  
  // Table headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('No. of', 17, tableY + 5);
  doc.text('Articles', 17, tableY + 9);
  doc.text('Nature of Goods said to contain', 50, tableY + 7);
  doc.text('Actual', 99, tableY + 5);
  doc.text('Weight', 99, tableY + 9);
  doc.text('Charged', 119, tableY + 5);
  doc.text('Weight', 119, tableY + 9);
  doc.text('FREIGHT AMOUNT', 157, tableY + 7);
  doc.text('PAID', 145, tableY + 18);
  doc.text('TO-PAY', 175, tableY + 18);
  doc.text('Rs.', 140, tableY + 24);
  doc.text('P.', 162, tableY + 24);
  doc.text('Rs.', 172, tableY + 24);
  doc.text('P.', 194, tableY + 24);

  // Data
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(consignment.articles_count || '1', 20, tableY + 18);
  doc.text(consignment.goods_description || '', 35, tableY + 18);
  doc.text(consignment.weight || '', 99, tableY + 18);
  doc.text(consignment.charged_weight || consignment.weight || '', 119, tableY + 18);

  // Freight rows
  let rowY = tableY + 32;
  const drawRow = (label: string, val: number) => {
    doc.line(135, rowY, 200, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(label, 133, rowY - 2, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(String(val), 172, rowY - 2);
    rowY += 6;
  };

  drawRow('Rate', consignment.freight_amount || 0);
  drawRow('Handling', consignment.handling_charges || 0);
  drawRow('Halting', consignment.halting_charges || 0);
  drawRow('SGST', consignment.sgst || 0);
  drawRow('CGST', consignment.cgst || 0);
  
  // Grand Total
  const grandTotal = (consignment.freight_amount || 0) + 
                     (consignment.handling_charges || 0) + 
                     (consignment.halting_charges || 0) +
                     (consignment.sgst || 0) +
                     (consignment.cgst || 0);
  
  doc.line(135, rowY, 200, rowY);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total', 133, rowY - 2, { align: 'right' });
  doc.text(String(grandTotal), 172, rowY - 2);

  // Bottom text
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text("GST Paid by Party's Consignor/Consignee", 15, tableY + 65);

  // Bank details box
  doc.rect(15, 274, 75, 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(info.bankName, 17, 278);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(info.bankBranch, 17, 281);
  doc.text(`A/c No. ${info.accountNumber}`, 17, 284);
  doc.text(`IFSC Code : ${info.ifsc}`, 17, 287);

  // Declaration
  doc.setFontSize(6);
  doc.text('Declaration:', 95, 274);
  doc.text('Pay GST 5% on your GST Number', 95, 277);
  doc.text('legal services chargeable on reverse charge', 95, 280);
  doc.text('basis payable by recipient of services', 95, 283);
  doc.text('notification no 13/2017/28/62017', 95, 286);

  // Signature section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('For SREE DAMODAR TRADERS', 155, 274);
  doc.setFontSize(7);
  doc.text('BOOKING CLERK / MANAGER', 155, 285);

  doc.save(`LR_${consignment.consignment_no}_Traders.pdf`);
};
