const express = require("express");
const fileRouter = express.Router();
const File = require("../models/file");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const authmiddleware = require("../middleware/authMiddleware");

// API to create a file
fileRouter.post("/create-files", authmiddleware, async (req, res) => {
  const { fileNumber, dispatchedDate, to, currentStatus, remarks } = req.body;
  const uploadedBy = req.user._id; // 🟢 updated to use full user object

  try {
    const existingFile = await File.findOne({ fileNumber });
    if (existingFile) {
      return res
        .status(400)
        .json({ message: "File with this number already exists" });
    }

    // if this is not entred dont go any futher
    if (
      !fileNumber ||
      !dispatchedDate ||
      !to ||
      !currentStatus ||
      !uploadedBy
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newFile = new File({
      fileNumber,
      dispatchedDate,
      to,
      currentStatus,
      remarks,
      uploadedBy, // Assuming the user ID is in the decoded token
    });

    const savedFile = await newFile.save();

    res.status(201).json({
      message: "New File Created Successfully",
    });
  } catch (error) {
    console.error("Error creating file:");
    res.status(500).json({
      message: "Error Creating the file",
      error,
    });
  }
});

// API to get all files
fileRouter.get("/get-files", authmiddleware, async (req, res) => {
  const toyou = req.user._id; // 🟢 updated to use full user object

  try {
    const files = await File.find({ to: toyou }).populate(
      "uploadedBy",
      "firstName lastName"
    );
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Error fetching files", error });
  }
});

// API to delete a file that is assigned to the user
fileRouter.delete("/delete-file/:id", authmiddleware, async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user._id; // 🟢 updated to use full user object

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this file" });
    }

    await File.findByIdAndDelete(fileId);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Error deleting file", error });
  }
});

// API to update a file
fileRouter.put("/update-file/:id", authmiddleware, async (req, res) => {
  const fileId = req.params.id;
  const { fileNumber, dispatchedDate, to, currentStatus, remarks } = req.body;
  const userId = req.user._id; // 🟢 updated to use full user object

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this file" });
    }

    // Update the file fields
    file.fileNumber = fileNumber || file.fileNumber;
    file.dispatchedDate = dispatchedDate || file.dispatchedDate;
    file.to = to || file.to;
    file.currentStatus = currentStatus || file.currentStatus;
    file.remarks = remarks || file.remarks;

    const updatedFile = await file.save();
    res.status(200).json({
      message: "File updated successfully",
      updatedFile,
    });
  } catch (error) {
    console.error("Error updating file:", error);
    res.status(500).json({ message: "Error updating file", error });
  }
});

// API to get all files uploaded by a user
fileRouter.get(
  "/get-uploaded-files-by-user",
  authmiddleware,
  async (req, res) => {
    const userId = req.user._id; // 🟢 updated to use full user object

    try {
      const files = await File.find({ uploadedBy: userId }).populate(
        "uploadedBy",
        "firstName lastName"
      );
      res.status(200).json(files);
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
      res.status(500).json({ message: "Error fetching uploaded files", error });
    }
  }
);

// API to get all files in the system
// This endpoint is for admin users to view all files
// It is protected by an admin middleware

fileRouter.get("/get-all-files", authmiddleware, async (req, res) => {
  const authMiddleware = require("../middleware/authMiddleware.js");
  try {
    // Check if the user is an admin
    const loggedinUser = req.user; // 🟢 updated to use full user object
    if (loggedinUser.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this resource" });
    }
    const files = await User.find();
    res.status(200).json(files);
  } catch (error) {
    console.error("You are not authorasied to asscess all files:", error);
    res.status(500).json({ message: "Error fetching all files", error });
  }
});

module.exports = fileRouter;
