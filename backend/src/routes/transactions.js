const express = require('express');
const router = express.Router();
const { protect: authenticate } = require('../middleware/auth');
const {
  getTransactions,
  getTransactionSummary,
  createTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
} = require('../controllers/transactionController');

// All routes are protected — must be logged in
router.use(authenticate);

// Static paths first (before /:id to avoid conflicts)
router.get('/',        getTransactions);        // GET    /api/transactions
router.get('/summary', getTransactionSummary);  // GET    /api/transactions/summary
router.post('/',       createTransactions);     // POST   /api/transactions
router.delete('/all',  deleteAllTransactions);  // DELETE /api/transactions/all

// Dynamic :id paths
router.get('/:id',     getTransaction);         // GET    /api/transactions/:id
router.put('/:id',     updateTransaction);       // PUT    /api/transactions/:id
router.delete('/:id',  deleteTransaction);       // DELETE /api/transactions/:id

module.exports = router;
