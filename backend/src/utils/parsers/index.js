const { detectStatementProvider } = require('./detector');
const { normalizeTransactions } = require('./normalizer');
const { parsePhonePe } = require('./phonepeParser');
const { parseGenericUPIText } = require('./genericParser');

function parseUPIStatement(text) {
  const provider = detectStatementProvider(text);

  let transactions = [];

  switch (provider) {
    case 'PHONEPE':
      transactions = parsePhonePe(text);
      break;

    default:
      transactions = parseGenericUPIText(text);
      break;
  }

  return {
    provider,
    transactions: normalizeTransactions(transactions),
  };
}

module.exports = {
  parseUPIStatement,
};