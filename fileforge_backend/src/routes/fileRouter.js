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

module.exports = fileRouter;
