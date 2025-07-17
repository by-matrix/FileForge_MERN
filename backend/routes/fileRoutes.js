// routes/fileRoutes.js
const express = require('express');
const router = express.Router();

// Import the controller functions
const {
  createFile,
  getFiles,
  getUploadedFiles,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile
} = require('../controllers/fileController');

// Import auth middleware
const { auth } = require('../middleware/auth');

// GET /api/files - Get files assigned to current user (supports ?limit=X)
router.get('/', auth, getFiles);

// GET /api/files/uploaded - Get files uploaded by current user
router.get('/uploaded', auth, getUploadedFiles);

// GET /api/files/all - Get all files (admin only) (supports ?limit=X)
router.get('/all', auth, getAllFiles);

// GET /api/files/:id - Get single file by ID
router.get('/:id', auth, getFileById);

// POST /api/files - Create new file
router.post('/', auth, createFile);

// PUT /api/files/:id - Update file
router.put('/:id', auth, updateFile);

// DELETE /api/files/:id - Delete file
router.delete('/:id', auth, deleteFile);

module.exports = router;