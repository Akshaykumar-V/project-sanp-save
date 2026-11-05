jest.mock('../src/models/Transaction', () => ({
  collection: { createIndex: jest.fn() },
  exists: jest.fn(),
  create: jest.fn(),
}));

let Transaction;
let identity;
let importTransactions;

const row = (overrides = {}) => ({
  provider: 'PHONEPE',
  transactionId: 'TXN123456',
  utrNumber: '123456789012',
  date: new Date('2026-11-03'),
  merchant: 'Swiggy',
  amount: 250,
  type: 'DEBIT',
  category: 'food',
  ...overrides,
});

beforeEach(() => {
  jest.resetModules();
  Transaction = require('../src/models/Transaction');
  ({ identity, importTransactions } = require('../src/utils/importTransactions'));
  Transaction.collection.createIndex.mockResolvedValue('unique_user_import_keys');
  Transaction.exists.mockResolvedValue(false);
  Transaction.create.mockImplementation(async (doc) => ({ toObject: () => ({ ...doc }) }));
});

test('uses explicit UTR and provider-scoped transaction ID as keys', () => {
  expect(identity(row())).toEqual({
    keys: ['utr:123456789012', 'id:PHONEPE:TXN123456'],
    alternatives: [{ utrNumber: '123456789012' }, { provider: 'PHONEPE', transactionId: 'TXN123456' }],
  });
});

test('does not infer identity from equal date, amount, and merchant', () => {
  expect(identity(row({ transactionId: null, utrNumber: null }))).toEqual({ keys: [], alternatives: [] });
});

test('rejects malformed identifiers and IDs without digits', () => {
  expect(identity(row({ transactionId: 'ABCDEF', utrNumber: '123' }))).toEqual({ keys: [], alternatives: [] });
});

test('saves an identified transaction with user-scoped keys and hides internal keys', async () => {
  const result = await importTransactions([row()], 'user-a');
  expect(Transaction.collection.createIndex).toHaveBeenCalledWith(
    { user: 1, importKeys: 1 },
    expect.objectContaining({ unique: true, partialFilterExpression: { importKeys: { $exists: true } } })
  );
  expect(Transaction.exists).toHaveBeenCalledWith(expect.objectContaining({ user: 'user-a' }));
  expect(Transaction.create).toHaveBeenCalledWith(expect.objectContaining({
    user: 'user-a', importKeys: ['utr:123456789012', 'id:PHONEPE:TXN123456'],
  }));
  expect(result).toEqual({ saved: [expect.objectContaining({ user: 'user-a' })], duplicates: 0, errors: [] });
  expect(result.saved[0].importKeys).toBeUndefined();
});

test('recognizes a legacy record by UTR or provider and transaction ID', async () => {
  Transaction.exists.mockResolvedValue(true);
  const result = await importTransactions([row()], 'user-a');
  expect(result).toEqual({ saved: [], duplicates: 1, errors: [] });
  expect(Transaction.exists.mock.calls[0][0].$or).toEqual([
    { importKeys: { $in: ['utr:123456789012', 'id:PHONEPE:TXN123456'] } },
    { utrNumber: '123456789012' },
    { provider: 'PHONEPE', transactionId: 'TXN123456' },
  ]);
  expect(Transaction.create).not.toHaveBeenCalled();
});

test('same-value transactions without identifiers are both legitimate', async () => {
  const equal = row({ transactionId: null, utrNumber: null });
  const result = await importTransactions([equal, { ...equal }], 'user-a');
  expect(result.saved).toHaveLength(2);
  expect(result.duplicates).toBe(0);
  expect(Transaction.exists).not.toHaveBeenCalled();
  expect(Transaction.create).toHaveBeenCalledTimes(2);
});

test('repeat identified upload reports one skipped and no new rows', async () => {
  Transaction.exists.mockResolvedValue(true);
  const result = await importTransactions([row()], 'user-a');
  expect(result.saved).toHaveLength(0);
  expect(result.duplicates).toBe(1);
});

test('a concurrent unique-key winner is counted as a duplicate', async () => {
  Transaction.exists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  Transaction.create.mockRejectedValue({ code: 11000 });
  const result = await importTransactions([row()], 'user-a');
  expect(result).toEqual({ saved: [], duplicates: 1, errors: [] });
  expect(Transaction.exists.mock.calls[1][0]).toEqual({
    user: 'user-a', importKeys: { $in: ['utr:123456789012', 'id:PHONEPE:TXN123456'] },
  });
});

test('unconfirmed duplicate-key errors are reported as failures', async () => {
  Transaction.create.mockRejectedValue({ code: 11000 });
  const result = await importTransactions([row()], 'user-a');
  expect(result).toEqual({ saved: [], duplicates: 0, errors: ['A transaction could not be saved.'] });
});

test('database validation errors are reported without leaking details', async () => {
  Transaction.create.mockRejectedValue(new Error('private database detail'));
  const result = await importTransactions([row()], 'user-a');
  expect(result.errors).toEqual(['A transaction could not be saved.']);
});

test('index creation failure prevents all writes', async () => {
  Transaction.collection.createIndex.mockRejectedValue(new Error('index unavailable'));
  await expect(importTransactions([row()], 'user-a')).rejects.toThrow('index unavailable');
  expect(Transaction.create).not.toHaveBeenCalled();
});

test('a failed index creation is retried on the next import', async () => {
  Transaction.collection.createIndex
    .mockRejectedValueOnce(new Error('temporary index error'))
    .mockResolvedValueOnce('unique_user_import_keys');
  await expect(importTransactions([row()], 'user-a')).rejects.toThrow('temporary index error');
  const result = await importTransactions([row()], 'user-a');
  expect(Transaction.collection.createIndex).toHaveBeenCalledTimes(2);
  expect(result.saved).toHaveLength(1);
});
