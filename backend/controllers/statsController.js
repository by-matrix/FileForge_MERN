const File = require('../models/File');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin stats
      const totalFiles = await File.countDocuments();
      const totalUsers = await User.countDocuments();

      const statuses = ['Pending', 'In Progress', 'Completed', 'Reject', 'Archived', 'Urgent'];
      const statusStats = {};

      for (let status of statuses) {
        statusStats[status] = await File.countDocuments({ currentStatus: status });
      }

      return res.json({ 
        total_files: totalFiles,
        total_users: totalUsers, 
        status_breakdown: statusStats 
      });
    } else {
      //user stats
      const assignedFiles = await File.countDocuments({ to: req.user.id });
      const uploadedFiles = await File.countDocuments({ uploadedBy: req.user.id });

      const statuses = ['Pending', 'In Progress', 'Completed', 'Reject', 'Archived', 'Urgent'];
      const statusStats = {};

      //show status breakdown for files assigned to them
      for (let status of statuses) {
        statusStats[status] = await File.countDocuments({ 
          to: req.user.id, 
          currentStatus: status 
        });
      }

      return res.json({ 
        assigned_files: assignedFiles,
        uploaded_files: uploadedFiles, 
        status_breakdown: statusStats 
      });
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
};