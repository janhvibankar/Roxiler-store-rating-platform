const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/responseHandler');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint with MySQL Connectivity Check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await db.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  return sendSuccess(res, 200, 'Backend service is running smoothly.', {
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api', routes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
