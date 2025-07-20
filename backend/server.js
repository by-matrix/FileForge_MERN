const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - allow both CLIENT_URL and same-origin requests
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    `http://localhost:${PORT}`,
    `https://localhost:${PORT}`
  ].filter(Boolean), // Remove any undefined values
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// API Routes (keep these BEFORE static file serving)
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.put('/api/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const updateData = req.body;
    
    // Example for different databases:
    
    // For MongoDB with Mongoose:
    const updatedFile = await File.findByIdAndUpdate(fileId, updateData, { new: true });
    
    // For PostgreSQL/MySQL with Sequelize:
    // const updatedFile = await File.update(updateData, { where: { id: fileId } });
    
    // For raw SQL:
    // const updatedFile = await db.query('UPDATE files SET ... WHERE id = ?', [fileId]);
    
    if (!updatedFile) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ message: 'File updated successfully', data: updatedFile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from React build (AFTER all API routes)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle React routing - return all non-API requests to React app
// This must be the LAST route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});