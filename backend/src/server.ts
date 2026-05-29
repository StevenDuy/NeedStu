import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import sequelize, { connectDB } from './config/db';
import { upload } from './middlewares/upload';
import authRoutes from './routes/authRoutes';
import { initCleanerTask } from './services/cleaner';

// Import models to register them with Sequelize
import './models/User';
import './models/Otp';
import './models/ComputerHistory';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (MySQL XAMPP) and Sync Tables
const initDB = async () => {
  await connectDB();
  try {
    await sequelize.sync({ alter: true });
    console.log('[Database]: All tables synchronized/created successfully.');
    // Start background database cleaner task
    initCleanerTask();
  } catch (error) {
    console.error('[Database Error]: Tables synchronization failed:', error);
  }
};
initDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static uploaded files (allows frontend to load images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);

// Create HTTP Server for Socket.io integration
const server = http.createServer(app);

// Initialize Socket.io (Real-time connection)
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust to your frontend port if needed
    methods: ['GET', 'POST']
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`[Socket]: Client connected (${socket.id})`);

  socket.on('disconnect', () => {
    console.log(`[Socket]: Client disconnected (${socket.id})`);
  });
});

// API Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend NeedStu is running perfectly!' });
});

// API Route for testing Image Upload
app.post('/api/upload', upload.single('image'), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image file to upload.' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully!',
      filename: req.file.filename,
      url: fileUrl
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server (using server.listen instead of app.listen to support Socket.io)
server.listen(PORT, () => {
  console.log(`[Server]: NeedStu Backend is running at http://localhost:${PORT}`);
});
