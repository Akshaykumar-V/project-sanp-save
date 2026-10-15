const { identifyEntity } = require('../src/utils/entityIdentifier');

describe('Entity Identifier', () => {
  test('identifies a person from paid-to text', () => {
    const result = identifyEntity({
      merchant: 'Rahul',
      rawText: 'Paid to Rahul ₹500',
    });

    expect(result.entityType).toBe('PERSON');
    expect(result.entityKey).toBe('Rahul');
  });

  test('identifies a person from received-from text', () => {
    const result = identifyEntity({
      merchant: 'Rahul',
      rawText: 'Received from Rahul ₹200',
    });

    expect(result.entityType).toBe('PERSON');
    expect(result.entityKey).toBe('Rahul');
  });

  test('identifies a known merchant', () => {
    const result = identifyEntity({
      merchant: 'Amruth Tea',
      rawText: 'Paid to Amruth Tea ₹50',
    });

    expect(result.entityType).toBe('MERCHANT');
    expect(result.entityKey).toBe('Amruth Tea');
  });

  test('identifies Zomato as a merchant', () => {
    const result = identifyEntity({
      merchant: 'Zomato',
      rawText: 'Paid to Zomato ₹118.49',
    });

    expect(result.entityType).toBe('MERCHANT');
  });

  test('identifies self transfer', () => {
    const result = identifyEntity({
      merchant: 'Self Transfer',
      rawText: 'Self Transfer ₹1000',
    });

    expect(result.entityType).toBe('SELF_TRANSFER');
    expect(result.entityKey).toBeNull();
  });

  test('returns unknown when there is not enough information', () => {
    const result = identifyEntity({
      merchant: 'Rahul',
      rawText: '₹500',
    });

    expect(result.entityType).toBe('UNKNOWN');
    expect(result.entityKey).toBe('Rahul');
  });

  test('handles invalid input', () => {
    expect(identifyEntity(null)).toEqual({
      entityType: 'UNKNOWN',
      entityKey: null,
    });

    expect(identifyEntity(undefined)).toEqual({
      entityType: 'UNKNOWN',
      entityKey: null,
    });
  });
});