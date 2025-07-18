// user name handling and limit parameter is added
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const Notification = require('../models/Notification');
const User = require('../models/User');

// user display name
const getUserDisplayName = (user) => {
  if (!user) return 'Unknown';
  return `${user.firstName} ${user.lastName}`.trim() || user.phoneNumber || 'Unknown';
};

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

// Update file function
exports.updateFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const updateData = req.body;
    
    console.log('Updating file:', fileId);
    console.log('Update data:', updateData);
    
    //check user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // check file for permissions
    const existingFile = await File.findOne({ id: fileId });
    if (!existingFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    // admin has permission to update (admin, uploader, or assigned user)
    const hasPermission = req.user.role === 'admin' || 
                         existingFile.uploadedBy === req.user.id || 
                         existingFile.to === req.user.id;

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to update this file' });
    }

    // Update the file
    const updatedFile = await File.findOneAndUpdate(
      { id: fileId },
      updateData,
      { 
        new: true,           
        runValidators: true  
      }
    );

    if (!updatedFile) {
      return res.status(404).json({ error: 'File not found during update' });
    }

    //notification if status changed
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

    //assigned user names
    const uploader = await User.findOne({ id: updatedFile.uploadedBy });
    const assignedUser = await User.findOne({ id: updatedFile.to });
    
    const fileWithNames = {
      ...updatedFile.toObject(),
      uploadedByName: getUserDisplayName(uploader),
      assignedToName: getUserDisplayName(assignedUser)
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

//Get single file by id
exports.getFileById = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const file = await File.findOne({ id: fileId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    //permissions (admin, uploader or assigned user)
    const hasPermission = req.user.role === 'admin' || 
                         file.uploadedBy === req.user.id || 
                         file.to === req.user.id;

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to view this file' });
    }

    const uploader = await User.findOne({ id: file.uploadedBy });
    const assignedUser = await User.findOne({ id: file.to });
    
    const fileWithNames = {
      ...file.toObject(),
      uploadedByName: getUserDisplayName(uploader),
      assignedToName: getUserDisplayName(assignedUser)
    };

    res.json(fileWithNames);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

//Delete file
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const file = await File.findOne({ id: fileId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    //permissions for (admin or uploader)
    const hasPermission = req.user.role === 'admin' || file.uploadedBy === req.user.id;

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to delete this file' });
    }

    await File.findOneAndDelete({ id: fileId });
    
    //notification
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

//Get files with limit parameter
exports.getFiles = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Fetching files for user:', req.user.id);
    

    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    
    let query = File.find({ to: req.user.id })
      .sort({ uploadDate: -1 });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const files = await query;
    
    //uploadedByName section added for all file
    const filesWithNames = await Promise.all(files.map(async (file) => {
      const uploader = await User.findOne({ id: file.uploadedBy });
      return {
        ...file.toObject(),
        uploadedByName: getUserDisplayName(uploader)
      };
    }));

    console.log('Found files:', filesWithNames.length);
    
    res.json(filesWithNames);
  } catch (err) {
    console.error('Get files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//Get files uploaded by current user
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
        assignedToName: getUserDisplayName(assignedUser),
        uploadedByName: getUserDisplayName(req.user) // Current user is the uploader
      };
    }));

    res.json(filesWithNames);
  } catch (err) {
    console.error('Get uploaded files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//Get all files (admin only)
exports.getAllFiles = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    
    let query = File.find({})
      .sort({ uploadDate: -1 });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const files = await query;
    
    const filesWithNames = await Promise.all(files.map(async (file) => {
      const uploader = await User.findOne({ id: file.uploadedBy });
      const assignedUser = await User.findOne({ id: file.to });
      return {
        ...file.toObject(),
        uploadedByName: getUserDisplayName(uploader),
        assignedToName: getUserDisplayName(assignedUser)
      };
    }));

    res.json(filesWithNames);
  } catch (err) {
    console.error('Get all files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};