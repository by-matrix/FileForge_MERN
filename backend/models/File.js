const mongoose = require('mongoose');


const fileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fileNumber: { type: String, required: true, unique: true },
  dispatchedDate: { type: Date, required: true },
  to: { type: String, required: true },
  currentStatus: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Reject', 'Archived', 'Urgent'], default: 'Pending' },
  remarks: { type: String },
  uploadedBy: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);