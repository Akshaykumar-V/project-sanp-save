const SELF_TRANSFER_PATTERNS = [
  /\bself\s*transfer\b/i,
  /\bself\s*transferred\b/i,
  /\bself\s*transfered\b/i,
];

const PERSON_PATTERNS = [
  /\bpaid\s+to\b/i,
  /\bsent\s+to\b/i,
  /\btransfer(red)?\s+to\b/i,
  /\breceived\s+from\b/i,
  /\bfrom\s+[a-z]/i,
];

const MERCHANT_PATTERNS = [
  /\bmerchant\b/i,
  /\bstore\b/i,
  /\bshop\b/i,
  /\brestaurant\b/i,
  /\bcafe\b/i,
  /\bhotel\b/i,
  /\btea\b/i,
  /\bpetrol\b/i,
  /\brecharge\b/i,
  /\bpharmacy\b/i,
  /\bswiggy\b/i,
  /\bzomato\b/i,
  /\bamazon\b/i,
  /\bflipkart\b/i,
];

function identifyEntity(transaction) {
  if (!transaction || typeof transaction !== 'object') {
    return {
      entityType: 'UNKNOWN',
      entityKey: null,
    };
  }

  const text = [
    transaction.merchant,
    transaction.rawText,
  ]
    .filter(Boolean)
    .join(' ');

  if (SELF_TRANSFER_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      entityType: 'SELF_TRANSFER',
      entityKey: null,
    };
  }

  if (MERCHANT_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      entityType: 'MERCHANT',
      entityKey: transaction.merchant || null,
    };
  }

  if (PERSON_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      entityType: 'PERSON',
      entityKey: transaction.merchant || null,
    };
  }

  return {
    entityType: 'UNKNOWN',
    entityKey: transaction.merchant || null,
  };
}

module.exports = {
  identifyEntity,
};