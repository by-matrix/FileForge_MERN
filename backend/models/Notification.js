const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { type: String, enum: ['file_created', 'file_updated', 'file_deleted', 'status_changed'], required: true },
  message: { type: String, required: true },
  fileId: { type: String },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
