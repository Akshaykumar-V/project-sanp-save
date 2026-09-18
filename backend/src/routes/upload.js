const express = require('express');
const router = express.Router();
const { protect: authenticate } = require('../middleware/auth');
const { upload, uploadPDF } = require('../controllers/uploadController');

// POST /api/upload — protected, single PDF file
router.post('/', authenticate, upload, uploadPDF);

module.exports = router;
