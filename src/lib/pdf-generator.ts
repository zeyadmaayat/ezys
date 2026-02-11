import jsPDF from 'jspdf';

interface DocumentData {
  document_type: string;
  document_title: string;
  document_number: string;
  date: string;
  shipper: {
    name: string;
    address: string;
    country: string;
    phone: string;
    email: string;
  };
  consignee: {
    name: string;
    address: string;
    country: string;
    phone: string;
    email: string;
  };
  shipment_details: {
    origin: string;
    destination: string;
    mode_of_transport: string;
    vessel_flight: string;
    port_of_loading: string;
    port_of_discharge: string;
    terms_of_delivery: string;
  };
  items: Array<{
    description: string;
    hs_code: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total_price: number;
    weight_kg: number;
    dimensions: string;
  }>;
  totals: {
    total_packages: number;
    total_weight_kg: number;
    total_volume_cbm: number;
    subtotal: number;
    freight_charges: number;
    insurance: number;
    total_value: number;
    currency: string;
  };
  additional_info: {
    country_of_origin: string;
    payment_terms: string;
    bank_details: string;
    special_instructions: string;
    declarations: string;
  };
}

function drawLine(doc: jsPDF, y: number) {
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
}

function addSection(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 120);
  doc.text(title, 15, y);
  y += 2;
  drawLine(doc, y);
  return y + 6;
}

function addField(doc: jsPDF, label: string, value: string, x: number, y: number): number {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(label, x, y);
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.text(value || '—', x, y + 4);
  return y + 10;
}

export function generateShippingDocumentPDF(data: DocumentData): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 15;

  // Header
  doc.setFillColor(20, 50, 100);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.document_title.toUpperCase(), 15, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No: ${data.document_number}`, 15, 22);
  doc.text(`Date: ${data.date}`, 15, 28);
  
  doc.setFontSize(9);
  doc.text('LogiPro Hub', 160, 15);
  doc.text('Logistics ERP', 160, 20);
  
  y = 42;
  doc.setTextColor(30, 30, 30);

  // Shipper & Consignee side by side
  y = addSection(doc, 'SHIPPER / EXPORTER', y);
  const shipperY = y;
  y = addField(doc, 'Name', data.shipper.name, 15, y);
  y = addField(doc, 'Address', data.shipper.address, 15, y);
  y = addField(doc, 'Country', data.shipper.country, 15, y);
  y = addField(doc, 'Phone', data.shipper.phone, 15, y);
  
  let cy = addSection(doc, 'CONSIGNEE / IMPORTER', shipperY - 6);
  // Right side
  addField(doc, 'Name', data.consignee.name, 110, shipperY);
  addField(doc, 'Address', data.consignee.address, 110, shipperY + 10);
  addField(doc, 'Country', data.consignee.country, 110, shipperY + 20);
  addField(doc, 'Phone', data.consignee.phone, 110, shipperY + 30);

  y = Math.max(y, shipperY + 40) + 4;

  // Shipment Details
  y = addSection(doc, 'SHIPMENT DETAILS', y);
  const detailsStartY = y;
  addField(doc, 'Origin', data.shipment_details.origin, 15, y);
  addField(doc, 'Destination', data.shipment_details.destination, 75, y);
  addField(doc, 'Transport Mode', data.shipment_details.mode_of_transport, 140, y);
  y += 10;
  addField(doc, 'Port of Loading', data.shipment_details.port_of_loading, 15, y);
  addField(doc, 'Port of Discharge', data.shipment_details.port_of_discharge, 75, y);
  addField(doc, 'Terms', data.shipment_details.terms_of_delivery, 140, y);
  y += 14;

  // Items Table
  y = addSection(doc, 'ITEMS / GOODS', y);
  
  // Table header
  doc.setFillColor(240, 242, 245);
  doc.rect(15, y - 3, 180, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('#', 17, y + 1);
  doc.text('Description', 23, y + 1);
  doc.text('HS Code', 80, y + 1);
  doc.text('Qty', 110, y + 1);
  doc.text('Unit Price', 130, y + 1);
  doc.text('Weight(kg)', 155, y + 1);
  doc.text('Total', 178, y + 1);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  
  data.items.forEach((item, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    if (idx % 2 === 0) {
      doc.setFillColor(248, 249, 252);
      doc.rect(15, y - 3, 180, 6, 'F');
    }
    
    doc.setFontSize(8);
    doc.text(String(idx + 1), 17, y);
    doc.text(item.description?.substring(0, 30) || '', 23, y);
    doc.text(item.hs_code || '', 80, y);
    doc.text(`${item.quantity} ${item.unit}`, 110, y);
    doc.text(item.unit_price?.toFixed(2) || '0.00', 130, y);
    doc.text(item.weight_kg?.toFixed(1) || '0', 155, y);
    doc.text(item.total_price?.toFixed(2) || '0.00', 178, y);
    y += 6;
  });

  y += 4;
  drawLine(doc, y);
  y += 6;

  // Totals
  const totalsX = 130;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const addTotalRow = (label: string, value: string, bold = false) => {
    if (bold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    doc.text(label, totalsX, y);
    doc.text(value, 178, y);
    y += 5;
  };
  
  const cur = data.totals.currency || 'USD';
  addTotalRow('Total Packages:', String(data.totals.total_packages));
  addTotalRow('Total Weight:', `${data.totals.total_weight_kg} kg`);
  addTotalRow('Volume:', `${data.totals.total_volume_cbm} CBM`);
  addTotalRow('Subtotal:', `${cur} ${data.totals.subtotal?.toFixed(2)}`);
  if (data.totals.freight_charges) addTotalRow('Freight:', `${cur} ${data.totals.freight_charges?.toFixed(2)}`);
  if (data.totals.insurance) addTotalRow('Insurance:', `${cur} ${data.totals.insurance?.toFixed(2)}`);
  y += 2;
  drawLine(doc, y);
  y += 5;
  addTotalRow('TOTAL VALUE:', `${cur} ${data.totals.total_value?.toFixed(2)}`, true);

  // Additional Info
  if (y > 240) { doc.addPage(); y = 20; }
  y += 6;
  y = addSection(doc, 'ADDITIONAL INFORMATION', y);
  
  if (data.additional_info.country_of_origin) {
    addField(doc, 'Country of Origin', data.additional_info.country_of_origin, 15, y);
    y += 10;
  }
  if (data.additional_info.payment_terms) {
    addField(doc, 'Payment Terms', data.additional_info.payment_terms, 15, y);
    y += 10;
  }
  if (data.additional_info.special_instructions) {
    addField(doc, 'Special Instructions', data.additional_info.special_instructions, 15, y);
    y += 10;
  }
  if (data.additional_info.declarations) {
    addField(doc, 'Declarations', data.additional_info.declarations, 15, y);
    y += 10;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 242, 245);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated by LogiPro Hub — Page ${i} of ${pageCount}`, 15, 289);
    doc.text(new Date().toISOString().split('T')[0], 175, 289);
  }

  return doc;
}

export function parseDocumentFromMessage(content: string): DocumentData | null {
  try {
    const match = content.match(/```document\s*([\s\S]*?)```/);
    if (!match) return null;
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
