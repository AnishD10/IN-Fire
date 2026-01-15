import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// ==========================================
// Email Transporter Configuration
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'manxekhatra@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'cioe umpl yavf roje'
  }
});

// ==========================================
// Send Welcome Email
// ==========================================
export async function sendWelcomeEmail(email) {
  const mailOptions = {
    from: process.env.ALERT_FROM_EMAIL || 'noreply@gasdetection.com',
    to: email,
    subject: '✓ Welcome to Gas Leakage Detection System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2ecc71;">Welcome to Our System</h2>
        <p>Thank you for subscribing to the Gas Leakage Detection System alerts.</p>
        <p>You will now receive immediate notifications whenever:</p>
        <ul>
          <li>Gas leakage is detected</li>
          <li>System status changes</li>
          <li>Important alerts are triggered</li>
        </ul>
        <p style="color: #7f8c8d;">You can unsubscribe anytime by visiting our website.</p>
        <hr style="border: none; border-top: 1px solid #ecf0f1;">
        <p style="font-size: 12px; color: #95a5a6;">
          <strong>IoT Gas Detection System</strong><br>
          Real-time monitoring for your safety
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`✗ Failed to send welcome email to ${email}:`, error);
    throw error;
  }
}

// ==========================================
// Send Alert Email
// ==========================================
export async function sendAlertEmail(email, message) {
  const mailOptions = {
    from: process.env.ALERT_FROM_EMAIL || 'noreply@gasdetection.com',
    to: email,
    subject: '🚨 GAS LEAKAGE ALERT - IMMEDIATE ACTION REQUIRED',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #e74c3c; color: white; padding: 20px; border-radius: 5px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">⚠️ GAS LEAKAGE DETECTED!</h2>
        </div>
        
        <div style="padding: 20px; background-color: #ecf0f1; margin: 20px 0; border-radius: 5px;">
          <p style="font-size: 16px; color: #2c3e50;"><strong>${message}</strong></p>
          <p style="color: #7f8c8d;">
            <strong>Time:</strong> ${new Date().toLocaleString()}<br>
            <strong>Action:</strong> Please check the system immediately!
          </p>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>Safety Instructions:</strong>
            <ul>
              <li>Evacuate the area immediately</li>
              <li>Turn off all electrical equipment</li>
              <li>Contact emergency services</li>
              <li>Do not use open flames or create sparks</li>
            </ul>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5173" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View System Dashboard
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #bdc3c7; margin: 30px 0;">
        <p style="font-size: 11px; color: #95a5a6; text-align: center;">
          This is an automated alert from the IoT Gas Detection System. For support, contact your administrator.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Alert email sent to ${email}`);
  } catch (error) {
    console.error(`✗ Failed to send alert email to ${email}:`, error);
    throw error;
  }
}

export default { sendWelcomeEmail, sendAlertEmail };
