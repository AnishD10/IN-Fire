import express from 'express';
import { addSubscriber, getSubscribers, removeSubscriber } from '../services/alertService.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// ==========================================
// POST /api/subscribe
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Add subscriber
    const result = await addSubscriber(email);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Send welcome email
    sendWelcomeEmail(email).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.json({
      success: true,
      message: 'Successfully subscribed to gas leakage alerts!',
      email: email,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// GET /api/subscribe/list
// ==========================================
router.get('/list', async (req, res) => {
  try {
    const subscribers = await getSubscribers();
    res.json({
      success: true,
      count: subscribers.length,
      subscribers: subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// DELETE /api/subscribe/:email
// ==========================================
router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await removeSubscriber(email);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed',
      email: email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
