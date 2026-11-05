const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { parseUPIStatement } = require('../src/utils/parsers');

test('synthetic demo PDF extracts seven transactions with expected totals', async () => {
  const file = path.join(__dirname, '..', '..', 'output', 'pdf', 'synthetic-phonepe-statement.pdf');
  const parser = new PDFParse({ data: fs.readFileSync(file) });
  let text;
  try {
    text = (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }

  const { provider, transactions } = parseUPIStatement(text);
  const spent = transactions.filter((t) => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0);
  const received = transactions.filter((t) => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);

  expect(provider).toBe('PHONEPE');
  expect(transactions).toHaveLength(7);
  expect(spent).toBe(1599);
  expect(received).toBe(5000);
  expect(received - spent).toBe(3401);
});
