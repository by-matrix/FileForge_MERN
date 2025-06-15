// const express = require('express');
// const fileRouter = express.Router();
// const File = require('../models/file');

// // API to create a file
// fileRouter.post('/api/files', async (req, res) => {
//     const { fileNumber, dispatchedDate, to, currentStatus, remarks, uploadedBy } = req.body;

//     if (!fileNumber || !dispatchedDate || !to || !currentStatus || !uploadedBy) {
//         return res.status(400).json({ message: 'Missing required fields' });
//     }

//     try {
//         const newFile = new File({
//             fileNumber,
//             dispatchedDate,
//             to,
//             currentStatus,
//             remarks,
//             uploadedBy
//         });

//         const savedFile = await newFile.save();

//         res.status(201).json({ message: 'File created successfully', file: savedFile });
//     } catch (error) {
//         res.status(500).json({ message: 'Error creating file', error });
//     }
// });

// module.exports = fileRouter;






















// // const express = require('express');
// // const File = require('../models/file') 

// // const fileRouter = express.Router();

// // //api to create a file
// // fileRouter.post('/files', async (req, res) => {
// //     const {
// //       fileNumber,
// //       dispatchedDate,
// //       to,
// //       currentStatus,
// //       remarks,
// //       uploadedBy,
// //     } = req.body;

// //     try {
// //       // Create a new file instance
// //       const newFile = new File({
// //         fileNumber,
// //         dispatchedDate,
// //         to,
// //         currentStatus,
// //         remarks,
// //         uploadedBy,
// //       });

// //       // Save the file to the database
// //       const savedFile = await newFile.save();

// //       res
// //         .status(201)
// //         .json({ message: "File created successfully", file: savedFile });
// //     } catch (error) {
// //       res.status(500).json({ message: "Error creating file", error });
// //     }
// // });


// // module.exports = fileRouter;
// // // api to get all files
// // router.get('/files', async (req, res) => {
// //     try {
// //         // Fetch all files from the database
// //         const files = await File.find().populate('uploadedBy', 'firstName lastName');

// //         res.status(200).json(files);
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error fetching files', error });
// //     }
// // });

// // // api to get a file by fileNumber
// // router.get('/files/:fileNumber', async (req, res) => {
// //     const { fileNumber } = req.params;

// //     try {
// //         // Fetch the file by fileNumber
// //         const file = await File.findOne({ fileNumber }).populate('uploadedBy', 'firstName lastName');

// //         if (!file) {
// //             return res.status(404).json({ message: 'File not found' });
// //         }

// //         res.status(200).json(file);
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error fetching file', error });
// //     }
// // });

// // //api to update a file
// // router.put('/files/:fileNumber', async (req, res) => {
// //     const { fileNumber } = req.params;
// //     const { dispatchedDate, to, currentStatus, remarks } = req.body;

// //     try {
// //         // Update the file by fileNumber
// //         const updatedFile = await File.findOneAndUpdate(
// //             { fileNumber },
// //             { dispatchedDate, to, currentStatus, remarks },
// //             { new: true }
// //         ).populate('uploadedBy', 'firstName lastName');

// //         if (!updatedFile) {
// //             return res.status(404).json({ message: 'File not found' });
// //         }

// //         res.status(200).json({ message: 'File updated successfully', file: updatedFile });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error updating file', error });
// //     }
// // });
// // // api to delete a file
// // router.delete('/files/:fileNumber', async (req, res) => {
// //     const { fileNumber } = req.params;

// //     try {
// //         // Delete the file by fileNumber
// //         const deletedFile = await File.findOneAndDelete({ fileNumber });

// //         if (!deletedFile) {
// //             return res.status(404).json({ message: 'File not found' });
// //         }

// //         res.status(200).json({ message: 'File deleted successfully' });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Error deleting file', error });
// //     }
// // });


