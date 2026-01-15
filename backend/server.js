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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL || 'https://in-fire.netlify.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
