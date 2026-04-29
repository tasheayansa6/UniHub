const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true } });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/teams/:teamId/tasks', require('./routes/taskRoutes'));
app.use('/api/teams/:teamId/messages', require('./routes/messageRoutes'));
app.use('/api/teams/:teamId/resources', require('./routes/resourceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => res.json({ message: 'UniHub API is running!' }));

// Socket.io — real-time chat
io.on('connection', (socket) => {
  socket.on('join-team', (teamId) => socket.join(teamId));
  socket.on('leave-team', (teamId) => socket.leave(teamId));
  socket.on('send-message', (data) => io.to(data.teamId).emit('new-message', data));
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
