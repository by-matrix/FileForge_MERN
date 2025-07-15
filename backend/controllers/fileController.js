const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const Notification = require('../models/Notification');

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

    res.status(201).json({ message: 'File created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await File.find({ to: req.user.id });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};