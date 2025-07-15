const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/', auth, fileController.createFile);
router.get('/', auth, fileController.getFiles); // Files assigned to user
router.get('/uploaded', auth, fileController.getUploadedFiles); // Files uploaded by user
router.get('/all', auth, adminOnly, fileController.getAllFiles); // All files (admin only)

module.exports = router;