// Updated fileController.js with updateFile function
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

// ADD THIS: Update file function
exports.updateFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const updateData = req.body;
    
    console.log('Updating file:', fileId);
    console.log('Update data:', updateData);
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Find the file first to check permissions
    const existingFile = await File.findById(fileId);
    if (!existingFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user has permission to update (either uploader or assigned user)
    if (existingFile.uploadedBy !== req.user.id && existingFile.to !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to update this file' });
    }

    // Update the file
    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      updateData,
      { 
        new: true,           // Return updated document
        runValidators: true  // Run schema validators
      }
    );

    // Create notification if status changed
    if (updateData.currentStatus && updateData.currentStatus !== existingFile.currentStatus) {
      const notification = new Notification({
        id: uuidv4(),
        userId: existingFile.uploadedBy,
        type: 'file_updated',
        message: `File ${existingFile.fileNumber} status updated to ${updateData.currentStatus}`,
        fileId: fileId
      });
      await notification.save();
    }

    // Get uploader name for response
    const uploader = await User.findOne({ id: updatedFile.uploadedBy });
    const assignedUser = await User.findOne({ id: updatedFile.to });
    
    const fileWithNames = {
      ...updatedFile.toObject(),
      uploadedByName: uploader?.name || 'Unknown',
      assignedToName: assignedUser?.name || 'Unknown'
    };

    res.json({ 
      message: 'File updated successfully',
      file: fileWithNames 
    });
    
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
};

// Get single file by ID
exports.getFileById = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions
    if (file.uploadedBy !== req.user.id && file.to !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this file' });
    }

    const uploader = await User.findOne({ id: file.uploadedBy });
    const assignedUser = await User.findOne({ id: file.to });
    
    const fileWithNames = {
      ...file.toObject(),
      uploadedByName: uploader?.name || 'Unknown',
      assignedToName: assignedUser?.name || 'Unknown'
    };

    res.json(fileWithNames);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions (only uploader can delete)
    if (file.uploadedBy !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this file' });
    }

    await File.findByIdAndDelete(fileId);
    
    // Create notification
    const notification = new Notification({
      id: uuidv4(),
      userId: file.to,
      type: 'file_deleted',
      message: `File ${file.fileNumber} has been deleted`,
      fileId: fileId
    });
    await notification.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
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

// Get files uploaded by current user
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

// Get all files (admin only)
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