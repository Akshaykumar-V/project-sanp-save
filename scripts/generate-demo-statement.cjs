// Generates a fictional, text-based PDF that SnapSave's PhonePe parser can read.
const fs = require('node:fs');
const path = require('node:path');

const output = path.join(__dirname, '..', 'output', 'pdf', 'synthetic-phonepe-statement.pdf');
const rows = [
  '01/11/2026 Received from Demo Salary 5000.00',
  '01/11/2026 Paid to Swiggy 250.00',
  '02/11/2026 Paid to Uber 180.00',
  '02/11/2026 Paid to Swiggy 150.00',
  '02/11/2026 Paid to Amazon 600.00',
  '02/11/2026 Paid to Airtel 299.00',
  '03/11/2026 Paid to Swiggy 120.00',
];

const escape = (value) => value.replace(/[\\()]/g, '\\$&');
const line = (text, x, y, size = 12) =>
  `BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escape(text)}) Tj ET`;
const stream = [
  line('PhonePe - SYNTHETIC DEMONSTRATION STATEMENT', 48, 745, 17),
  line('Fictional transactions only. Not a real financial statement.', 48, 716, 10),
  line('Statement period: November 2026', 48, 690, 11),
  line('Date / description / amount (INR)', 48, 652, 12),
  ...rows.map((row, index) => line(row, 48, 620 - index * 34, 12)),
  line('Expected: 7 transactions; spent 1599.00; received 5000.00; balance 3401.00', 48, 340, 10),
].join('\n');

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
];
let pdf = '%PDF-1.4\n';
const offsets = [0];
for (const [index, object] of objects.entries()) {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
}
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, pdf);
console.log(`Wrote ${output}`);
