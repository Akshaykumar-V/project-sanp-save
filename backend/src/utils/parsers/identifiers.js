// Accept explicit labels only. Never infer identity from amount/date/merchant.
function extractIdentifiers(line) {
  const transaction = line.match(/\bTransaction\s*ID\s*[:#-]?\s*([A-Za-z0-9]{6,64})\b/i);
  const utr = line.match(/\bUTR(?:\s*(?:No\.?|Number))?\s*[:#-]?\s*(\d{12})\b/i);
  return {
    transactionId: transaction?.[1] || null,
    utrNumber: utr?.[1] || null,
    text: line
      .replace(transaction?.[0] || /$^/, '')
      .replace(utr?.[0] || /$^/, ''),
  };
}

module.exports = { extractIdentifiers };
