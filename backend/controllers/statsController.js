const File = require('../models/File');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const totalFiles = await File.countDocuments();
      const totalUsers = await User.countDocuments();

      const statuses = ['Pending', 'In Progress', 'Completed', 'Reject', 'Archived', 'Urgent'];
      const statusStats = {};

      for (let status of statuses) {
        statusStats[status] = await File.countDocuments({ currentStatus: status });
      }

      return res.json({ totalFiles, totalUsers, statusBreakdown: statusStats });
    } else {
      const assignedFiles = await File.countDocuments({ to: req.user.id });
      const uploadedFiles = await File.countDocuments({ uploadedBy: req.user.id });

      const statuses = ['Pending', 'In Progress', 'Completed', 'Reject', 'Archived', 'Urgent'];
      const statusStats = {};

      for (let status of statuses) {
        statusStats[status] = await File.countDocuments({ to: req.user.id, currentStatus: status });
      }

      return res.json({ assignedFiles, uploadedFiles, statusBreakdown: statusStats });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
