const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

//all notifications for the current user
router.get('/', auth, notificationController.getNotifications);

//notification as read
router.put('/:notificationId/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', auth, notificationController.markAllAsRead);

// Delete a specific notification
router.delete('/:notificationId', auth, notificationController.deleteNotification);

module.exports = router;