// MongoDB connection setup for SnapSave backend
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || '';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function logSuccess(msg) {
  console.log(`✅ [MongoDB] ${msg}`);
}
function logError(msg) {
  console.error(`❌ [MongoDB] ${msg}`);
}

async function connectDB(retries = 0) {
  if (!MONGODB_URI) {
    logError('MONGODB_URI is not set in environment variables.');
    return false;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    logSuccess('Connection established.');
    return true;
  } catch (err) {
    logError(`Connection failed: ${err.message}`);
    if (retries < MAX_RETRIES) {
      logError(`Retrying in ${RETRY_DELAY_MS / 1000}s... [${retries + 1}/${MAX_RETRIES}]`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return connectDB(retries + 1);
    } else {
      logError('Max retries reached. Backend running in offline/demo DB mode.');
      return false;
    }
  }
}

module.exports = { connectDB };
