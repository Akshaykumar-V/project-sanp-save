const express = require('express');
const router = express.Router();
const { protect: authenticate } = require('../middleware/auth');
const {
  getGoals,
  createGoal,
  getGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');

// All routes are protected
router.use(authenticate);

router.get('/', getGoals);          // GET    /api/goals
router.post('/', createGoal);       // POST   /api/goals
router.get('/:id', getGoal);        // GET    /api/goals/:id
router.put('/:id', updateGoal);     // PUT    /api/goals/:id
router.delete('/:id', deleteGoal);  // DELETE /api/goals/:id

module.exports = router;
