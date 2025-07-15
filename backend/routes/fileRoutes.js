// const express = require('express');
// const router = express.Router();
// const fileController = require('../controllers/fileController');
// const { auth, adminOnly } = require('../middleware/auth');

// router.post('/', auth, fileController.createFile);
// router.get('/', auth, fileController.getFiles); // Files assigned to user
// router.get('/uploaded', auth, fileController.getUploadedFiles); // Files uploaded by user
// router.get('/all', auth, adminOnly, fileController.getAllFiles); // All files (admin only)

// module.exports = router;


// routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const {
  createFile,
  getFiles,
  getUploadedFiles,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile
} = require('../controllers/fileController');

// Middleware to verify token (make sure you have this)
const auth = require('../middleware/auth');

// GET /api/files - Get files assigned to current user
router.get('/', auth, getFiles);

// GET /api/files/uploaded - Get files uploaded by current user
router.get('/uploaded', auth, getUploadedFiles);

// GET /api/files/all - Get all files (admin only)
router.get('/all', auth, getAllFiles);

// GET /api/files/:id - Get single file by ID
router.get('/:id', auth, getFileById);

// POST /api/files - Create new file
router.post('/', auth, createFile);

// PUT /api/files/:id - Update file (THIS IS THE IMPORTANT ONE)
router.put('/:id', auth, updateFile);

// DELETE /api/files/:id - Delete file
router.delete('/:id', auth, deleteFile);

module.exports = router;