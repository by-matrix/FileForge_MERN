const express = require('express');
const router = express.Router();

// Importfunctions
const {
  createFile,
  getFiles,
  getUploadedFiles,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile
} = require('../controllers/fileController');

//auth middleware
const { auth } = require('../middleware/auth');

//Get files assigned to current use
router.get('/', auth, getFiles);

//Get files uploaded by current user
router.get('/uploaded', auth, getUploadedFiles);

//Get all files (admin only)
router.get('/all', auth, getAllFiles);

//Get single file by ID
router.get('/:id', auth, getFileById);

//Create new file
router.post('/', auth, createFile);

//update file
router.put('/:id', auth, updateFile);

//Delete file
router.delete('/:id', auth, deleteFile);

module.exports = router;