const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); //new file first
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Find the notification and check it, if it belongs to the current user
    const notification = await Notification.findOne({ 
      id: notificationId, 
      userId: userId 
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    //notification to mark as read
    const updatedNotification = await Notification.findOneAndUpdate(
      { id: notificationId, userId: userId },
      { read: true },
      { new: true }
    );

    res.json(updatedNotification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    //notifications for the user unread
    await Notification.updateMany(
      { userId: userId, read: false },
      { read: true }
    );

    //updated notifications
    const notifications = await Notification.find({ userId: userId })
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ 
      id: notificationId, 
      userId: userId 
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await Notification.findOneAndDelete({ id: notificationId, userId: userId });
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Server error' });
  }
};