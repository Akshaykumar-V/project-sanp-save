const Transaction = require('../models/Transaction');

function identity(transaction) {
  const keys = [];
  const alternatives = [];
  const { provider, transactionId, utrNumber } = transaction;
  if (typeof utrNumber === 'string' && /^\d{12}$/.test(utrNumber)) {
    keys.push(`utr:${utrNumber}`);
    alternatives.push({ utrNumber });
  }
  if (provider && provider !== 'UNKNOWN' && typeof transactionId === 'string' &&
      /^[A-Za-z0-9]{6,64}$/.test(transactionId) && /\d/.test(transactionId)) {
    keys.push(`id:${provider}:${transactionId}`);
    alternatives.push({ provider, transactionId });
  }
  return { keys, alternatives };
}

let indexReady;
async function importTransactions(transactions, user) {
  // Fail closed if the concurrency guard cannot be installed, even with autoIndex disabled.
  if (!indexReady) {
    indexReady = Transaction.collection.createIndex({ user: 1, importKeys: 1 }, {
      name: 'unique_user_import_keys',
      unique: true,
      partialFilterExpression: { importKeys: { $exists: true } },
    }).catch((error) => {
      indexReady = undefined;
      throw error;
    });
  }
  await indexReady;
  const saved = [];
  let duplicates = 0;
  const errors = [];
  for (const transaction of transactions) {
    const { keys, alternatives } = identity(transaction);
    try {
      // Also recognize identifiers on legacy records without changing those records.
      if (keys.length && await Transaction.exists({ user, $or: [
        { importKeys: { $in: keys } }, ...alternatives,
      ] })) {
        duplicates++;
        continue;
      }
      const doc = await Transaction.create({ ...transaction, user,
        ...(keys.length ? { importKeys: keys } : {}),
      });
      const result = doc.toObject();
      delete result.importKeys;
      saved.push(result);
    } catch (error) {
      // A concurrent winner must be visible before a duplicate error is accepted.
      if (error.code === 11000 && keys.length &&
          await Transaction.exists({ user, importKeys: { $in: keys } })) {
        duplicates++;
      } else {
        errors.push('A transaction could not be saved.');
      }
    }
  }
  return { saved, duplicates, errors };
}

module.exports = { importTransactions, identity };
