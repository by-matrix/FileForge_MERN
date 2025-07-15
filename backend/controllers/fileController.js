// 1. Updated fileController.js - Fixed response structure
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createFile = async (req, res) => {
  const { fileNumber, dispatchedDate, to, currentStatus, remarks } = req.body;
  try {
    const existing = await File.findOne({ fileNumber });
    if (existing) return res.status(400).json({ error: 'File already exists' });

    const file = new File({
      id: uuidv4(),
      fileNumber,
      dispatchedDate,
      to,
      currentStatus,
      remarks,
      uploadedBy: req.user.id
    });
    await file.save();

    const notification = new Notification({
      id: uuidv4(),
      userId: to,
      type: 'file_created',
      message: `New file ${fileNumber} has been assigned to you`,
      fileId: file.id
    });
    await notification.save();

    res.status(201).json({ message: 'File created successfully', file });
  } catch (err) {
    console.error('Create file error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Fixed getFiles - Returns array directly (like frontend expects)
exports.getFiles = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Fetching files for user:', req.user.id);
    
    const files = await File.find({ to: req.user.id })
      .populate('uploadedBy', 'name') // Populate user name
      .sort({ uploadDate: -1 });
    
    // Add uploadedByName field for each file
    const filesWithNames = await Promise.all(files.map(async (file) => {
      const uploader = await User.findOne({ id: file.uploadedBy });
      return {
        ...file.toObject(),
        uploadedByName: uploader?.name || 'Unknown'
      };
    }));

    console.log('Found files:', filesWithNames.length);
    
    // Return array directly (not wrapped in object)
    res.json(filesWithNames);
  } catch (err) {
    console.error('Get files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// New: Get files uploaded by current user
exports.getUploadedFiles = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const files = await File.find({ uploadedBy: req.user.id })
      .sort({ uploadDate: -1 });
    
    const filesWithNames = await Promise.all(files.map(async (file) => {
      const assignedUser = await User.findOne({ id: file.to });
      return {
        ...file.toObject(),
        assignedToName: assignedUser?.name || 'Unknown'
      };
    }));

    res.json(filesWithNames);
  } catch (err) {
    console.error('Get uploaded files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// New: Get all files (admin only)
exports.getAllFiles = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const files = await File.find({})
      .sort({ uploadDate: -1 });
    
    const filesWithNames = await Promise.all(files.map(async (file) => {
      const uploader = await User.findOne({ id: file.uploadedBy });
      const assignedUser = await User.findOne({ id: file.to });
      return {
        ...file.toObject(),
        uploadedByName: uploader?.name || 'Unknown',
        assignedToName: assignedUser?.name || 'Unknown'
      };
    }));

    res.json(filesWithNames);
  } catch (err) {
    console.error('Get all files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};