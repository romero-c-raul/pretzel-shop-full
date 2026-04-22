const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const pool = require('./config/database');
const redisClient = require('./config/redis');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['X-Session-Id']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

const gracefulShutdown = async () => {
  console.log('Initiating graceful shutdown...');

  setTimeout(() => {
    console.warn('Forcing shutdown after 8 seconds');
    process.exit(1);
  }, 8000); // Force shutdown after 8 seconds due to SIGKILL after 10 seconds

  server.close(async () => {
    try {
      await pool.end() // Close database pool connections
    } catch (err) {
      console.error('Error closing database pool:', err);
    }

    try {
      if (redisClient.isOpen) {
        await redisClient.quit(); // Close Redis client connection
      }
    } catch (err) {
      console.error('Error closing Redis client:', err);
    }
    
    console.log('Shutdown complete, exiting now.');
    process.exit(0);
  });
};


// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await gracefulShutdown();
});

