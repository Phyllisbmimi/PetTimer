const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { sendEmail, emailTemplates } = require('../config/email');

// In-memory store for verification codes (use Redis in production)
const verificationCodes = new Map();

// Generate random verification code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// POST /api/email/send-verification
router.post('/send-verification', async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Generate verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store code in memory
    verificationCodes.set(email, {
      code,
      type: type || 'email-verification',
      expiresAt,
      attempts: 0
    });

    // Send email
    const subject = type === 'password-reset' 
      ? '🔐 PetTimer Password Reset Code'
      : '🐾 PetTimer Email Verification Code';
    
    const html = type === 'password-reset'
      ? emailTemplates.passwordReset(code)
      : emailTemplates.verification(code);

    await sendEmail(email, subject, html);

    console.log(`✅ Verification code sent to ${email}: ${code}`);

    res.json({ 
      success: true, 
      message: 'Verification code sent successfully',
      expiresAt 
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification email' 
    });
  }
});

// POST /api/email/verify-code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and code are required' 
      });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Verification code not found or expired' 
      });
    }

    // Check expiration
    if (new Date() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ 
        success: false, 
        error: 'Verification code has expired' 
      });
    }

    // Check code
    if (code.toUpperCase() !== storedData.code) {
      storedData.attempts += 1;
      
      // Block after 5 failed attempts
      if (storedData.attempts >= 5) {
        verificationCodes.delete(email);
        return res.status(429).json({ 
          success: false, 
          error: 'Too many failed attempts. Please request a new code.' 
        });
      }

      return res.status(400).json({ 
        success: false, 
        error: 'Invalid verification code',
        attemptsRemaining: 5 - storedData.attempts
      });
    }

    // Code is valid - remove it
    verificationCodes.delete(email);

    res.json({ 
      success: true, 
      message: 'Code verified successfully' 
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify code' 
    });
  }
});

// POST /api/email/resend-code
router.post('/resend-code', async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Delete old code
    verificationCodes.delete(email);

    // Generate new code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    verificationCodes.set(email, {
      code,
      type: type || 'email-verification',
      expiresAt,
      attempts: 0
    });

    // Send email
    const subject = type === 'password-reset' 
      ? '🔐 PetTimer Password Reset Code'
      : '🐾 PetTimer Email Verification Code';
    
    const html = type === 'password-reset'
      ? emailTemplates.passwordReset(code)
      : emailTemplates.verification(code);

    await sendEmail(email, subject, html);

    console.log(`✅ Resent verification code to ${email}: ${code}`);

    res.json({ 
      success: true, 
      message: 'Verification code resent successfully',
      expiresAt 
    });
  } catch (error) {
    console.error('Error resending code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to resend verification code' 
    });
  }
});

module.exports = router;
