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

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://uni-hub-puce.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In production allow all vercel.app subdomains
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight for all routes
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
