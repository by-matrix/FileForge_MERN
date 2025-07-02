// create a file model for mongoose
// use user.js for reference
// use the following fields written in notebook


const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileNumber: {
        type: String,
        required: true,
        trim: true
    },
    dispatchedDate: {
        type: Date,
        required: true
    },
    to: {
        type: String,
        required: true,
        trim: true
    },
    currentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'Reject', 'Archived'],
        default: 'Pending'
    },
    remarks: {
        type: String,
        trim: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

const File = mongoose.model('File', fileSchema);
module.exports = File;

