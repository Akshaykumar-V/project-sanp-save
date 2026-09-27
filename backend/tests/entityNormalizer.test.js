const {
  normalizeEntityName,
  getEntityDisplayName,
} = require('../src/utils/entityNormalizer');

describe('Entity Normalizer', () => {
  test('normalizes merchant names consistently', () => {
    expect(normalizeEntityName('Amruth Tea')).toBe('amruth_tea');
    expect(normalizeEntityName('AMRUTH TEA')).toBe('amruth_tea');
    expect(normalizeEntityName('amruth tea')).toBe('amruth_tea');
  });

  test('collapses repeated spaces', () => {
    expect(normalizeEntityName('Amruth   Tea')).toBe('amruth_tea');
  });

  test('trims leading and trailing spaces', () => {
    expect(normalizeEntityName('  Rahul  ')).toBe('rahul');
  });

  test('removes punctuation', () => {
    expect(normalizeEntityName('Rahul-Kumar')).toBe('rahulkumar');
  });

  test('handles unicode text', () => {
    expect(normalizeEntityName('Café')).toBe('café');
  });

  test('returns empty string for invalid input', () => {
    expect(normalizeEntityName('')).toBe('');
    expect(normalizeEntityName(null)).toBe('');
    expect(normalizeEntityName(undefined)).toBe('');
  });

  test('creates readable display names', () => {
    expect(getEntityDisplayName('  Amruth   Tea  ')).toBe('Amruth Tea');
  });

  test('handles invalid display name input', () => {
    expect(getEntityDisplayName('')).toBe('Unknown Entity');
    expect(getEntityDisplayName(null)).toBe('Unknown Entity');
  });
});