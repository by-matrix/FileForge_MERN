const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

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

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});