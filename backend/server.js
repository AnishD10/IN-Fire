import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initMQTT } from './mqtt/mqttClient.js';
import gasRoutes from './routes/gasRoutes.js';
import controlRoutes from './routes/controlRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware
// ==========================================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files with correct MIME types
app.use(express.static('frontend/dist', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

// ==========================================
// Health Check
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// ==========================================
// Routes
// ==========================================
app.use('/api/gas', gasRoutes);
app.use('/api/control', controlRoutes);
app.use('/api/subscribe', subscriberRoutes);

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile('frontend/dist/index.html', { root: '.' });
});

// ==========================================
// Error Handling
// ==========================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// ==========================================
// Start Server & MQTT
// ==========================================
app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
  console.log('Initializing MQTT connection...');
  
  // Initialize MQTT connection
  initMQTT();
});
