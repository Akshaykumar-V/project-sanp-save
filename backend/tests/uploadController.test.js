const mockGetText = jest.fn();
const mockDestroy = jest.fn();
jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({ getText: mockGetText, destroy: mockDestroy })),
}));
jest.mock('../src/utils/parsers', () => ({ parseUPIStatement: jest.fn() }));
jest.mock('../src/utils/importTransactions', () => ({ importTransactions: jest.fn() }));

const { PDFParse } = require('pdf-parse');
const { parseUPIStatement } = require('../src/utils/parsers');
const { importTransactions } = require('../src/utils/importTransactions');
const { uploadPDF } = require('../src/controllers/uploadController');

const transaction = { date: new Date('2026-11-03'), merchant: 'Swiggy', amount: 250, type: 'DEBIT' };
const request = () => ({ file: { buffer: Buffer.from('%PDF'), originalname: 'demo.pdf' }, user: { id: 'user-a' } });
const response = () => {
  const res = { statusCode: 200, body: null };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn((body) => { res.body = body; return res; });
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetText.mockResolvedValue({ text: 'PhonePe\n03/11/2026 Paid to Swiggy ₹250' });
  mockDestroy.mockResolvedValue();
  parseUPIStatement.mockReturnValue({ provider: 'PHONEPE', transactions: [transaction] });
  importTransactions.mockResolvedValue({ saved: [transaction], duplicates: 0, errors: [] });
});

test('rejects a missing file', async () => {
  const res = response();
  await uploadPDF({ user: { id: 'user-a' } }, res);
  expect(res.statusCode).toBe(400);
  expect(res.body.success).toBe(false);
  expect(PDFParse).not.toHaveBeenCalled();
});

test('rejects a corrupt PDF and destroys the parser', async () => {
  mockGetText.mockRejectedValue(new Error('unreadable'));
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(400);
  expect(mockDestroy).toHaveBeenCalledTimes(1);
  expect(importTransactions).not.toHaveBeenCalled();
});

test('rejects a blank extracted PDF', async () => {
  mockGetText.mockResolvedValue({ text: '   ' });
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/extract text/i);
});

test('rejects a statement with no transactions', async () => {
  parseUPIStatement.mockReturnValue({ provider: 'PHONEPE', transactions: [] });
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(400);
  expect(res.body.message).toContain('PHONEPE');
  expect(importTransactions).not.toHaveBeenCalled();
});

test('new import returns an accurate 201 response', async () => {
  const res = response();
  await uploadPDF(request(), res);
  expect(importTransactions).toHaveBeenCalledWith([transaction], 'user-a');
  expect(res.statusCode).toBe(201);
  expect(res.body).toMatchObject({ success: true, count: 1, skipped: 0, total: 1 });
});

test('repeat import reports zero new rows and skipped count', async () => {
  importTransactions.mockResolvedValue({ saved: [], duplicates: 1, errors: [] });
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({ success: true, count: 0, skipped: 1, total: 1 });
  expect(res.body.message).toMatch(/No new transactions/i);
});

test('mixed new and duplicate rows report both counts', async () => {
  parseUPIStatement.mockReturnValue({ provider: 'PHONEPE', transactions: [transaction, transaction] });
  importTransactions.mockResolvedValue({ saved: [transaction], duplicates: 1, errors: [] });
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(201);
  expect(res.body).toMatchObject({ count: 1, skipped: 1, total: 2 });
});

test('partial database failure returns 207 with failure status and counts', async () => {
  parseUPIStatement.mockReturnValue({ provider: 'PHONEPE', transactions: [transaction, transaction] });
  importTransactions.mockResolvedValue({ saved: [transaction], duplicates: 0, errors: ['A transaction could not be saved.'] });
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(207);
  expect(res.body).toMatchObject({ success: false, count: 1, skipped: 0, total: 2 });
  expect(res.body.errors).toHaveLength(1);
});

test('all failed writes return 500 and no false success', async () => {
  importTransactions.mockResolvedValue({ saved: [], duplicates: 0, errors: ['A transaction could not be saved.'] });
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(500);
  expect(res.body.success).toBe(false);
});

test('index or database failure returns 500 without exposing details', async () => {
  importTransactions.mockRejectedValue(new Error('private database detail'));
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(500);
  expect(JSON.stringify(res.body)).not.toContain('private database detail');
});

test('parser failure returns a generic 500', async () => {
  parseUPIStatement.mockImplementation(() => { throw new Error('private parser detail'); });
  const res = response();
  await uploadPDF(request(), res);
  expect(res.statusCode).toBe(500);
  expect(JSON.stringify(res.body)).not.toContain('private parser detail');
});
