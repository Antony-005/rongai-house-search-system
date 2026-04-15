const PDFDocument = require('pdfkit');

function createPDF(res, title, buildContent) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('RongaiHomes', { align: 'center' });
  doc.fontSize(13).font('Helvetica').text(title, { align: 'center' });
  doc.fontSize(10).fillColor('#666')
     .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#1a3a5c').lineWidth(1.5).stroke();
  doc.moveDown();
  doc.fillColor('#000');

  buildContent(doc);

  doc.end();
}

function addTable(doc, headers, rows, colWidths) {
  const startX    = 50;
  const rowHeight = 22;
  let   y         = doc.y;

  // Header row background
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
     .fill('#1a3a5c');

  // Header text
  let x = startX;
  headers.forEach((h, i) => {
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')
       .text(h, x + 4, y + 6, { width: colWidths[i] - 8, lineBreak: false });
    x += colWidths[i];
  });

  y += rowHeight;

  // Data rows
  rows.forEach((row, ri) => {
    // Alternate row shading
    if (ri % 2 === 0) {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
         .fill('#eef4fb');
    }

    x = startX;
    row.forEach((cell, i) => {
      doc.fontSize(8).font('Helvetica').fillColor('#000000')
         .text(String(cell ?? '—'), x + 4, y + 6,
               { width: colWidths[i] - 8, lineBreak: false });
      x += colWidths[i];
    });

    // Row border
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
       .strokeColor('#cccccc').lineWidth(0.5).stroke();

    y += rowHeight;

    // Page break check
    if (y > 750) {
      doc.addPage();
      y = 50;
    }
  });

  doc.y = y + 10;
}

module.exports = { createPDF, addTable };