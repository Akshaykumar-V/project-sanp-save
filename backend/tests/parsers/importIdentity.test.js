const { extractIdentifiers } = require('../../src/utils/parsers/identifiers');
const { parseUPIStatement } = require('../../src/utils/parsers');
const { normalizeTransactions } = require('../../src/utils/parsers/normalizer');

test('extracts labeled transaction ID and UTR without changing the original line', () => {
  const line = '03/11/2026 Paid to Swiggy ₹250 Transaction ID: TXN123456 UTR: 123456789012';
  expect(extractIdentifiers(line)).toEqual({
    text: '03/11/2026 Paid to Swiggy ₹250  ',
    transactionId: 'TXN123456',
    utrNumber: '123456789012',
  });
  expect(line).toContain('UTR: 123456789012');
});

test('does not mistake an unlabeled number for a transaction identifier', () => {
  expect(extractIdentifiers('03/11/2026 Paid to Swiggy ₹250 123456789012')).toEqual({
    text: '03/11/2026 Paid to Swiggy ₹250 123456789012',
    transactionId: null,
    utrNumber: null,
  });
});

test('PhonePe parser preserves identifiers, provider, and raw text', () => {
  const line = 'PhonePe\n03/11/2026 Paid to Swiggy ₹250 Transaction ID: TXN123456 UTR: 123456789012';
  const result = parseUPIStatement(line);
  expect(result.transactions).toHaveLength(1);
  expect(result.transactions[0]).toMatchObject({
    merchant: 'Swiggy', amount: 250, provider: 'PHONEPE',
    transactionId: 'TXN123456', utrNumber: '123456789012',
    rawText: expect.stringContaining('Transaction ID: TXN123456'),
  });
});

test('generic parser ignores trailing UTR as an amount and preserves metadata', () => {
  const result = parseUPIStatement('Google Pay\n03/11/2026 Paid to Uber ₹180 UTR: 123456789012');
  expect(result.transactions).toHaveLength(1);
  expect(result.transactions[0]).toMatchObject({
    amount: 180, merchant: 'Uber', provider: 'GOOGLE_PAY', utrNumber: '123456789012',
  });
});

test('equal-value statement rows with different IDs remain distinct', () => {
  const result = parseUPIStatement(
    'PhonePe\n03/11/2026 Paid to Swiggy ₹250 Transaction ID: TXN123456\n' +
    '03/11/2026 Paid to Swiggy ₹250 Transaction ID: TXN123457'
  );
  expect(result.transactions).toHaveLength(2);
  expect(result.transactions.map((t) => t.transactionId)).toEqual(['TXN123456', 'TXN123457']);
});

test('normalizer retains entity metadata and rejects invalid transaction types', () => {
  const base = { date: new Date('2026-11-03'), merchant: 'Swiggy', amount: 250, category: 'food' };
  expect(normalizeTransactions([
    { ...base, type: 'DEBIT', entityKey: 'swiggy', entityType: 'MERCHANT', transactionRole: 'EXPENSE' },
    { ...base, type: 'UNKNOWN' },
  ])).toEqual([expect.objectContaining({
    entityKey: 'swiggy', entityType: 'MERCHANT', transactionRole: 'EXPENSE',
  })]);
});
