const nodemailer = require('nodemailer');

// Create email transporter based on configuration
const createTransporter = () => {
  const service = process.env.EMAIL_SERVICE;

  if (service === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  if (service === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Default SMTP configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"PetTimer" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  verification: (code) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px; }
        .header { text-align: center; color: #8b5cf6; }
        .code { font-size: 32px; font-weight: bold; color: #8b5cf6; text-align: center; letter-spacing: 5px; margin: 30px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">🐾 PetTimer Email Verification</h1>
        <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
        <div class="code">${code}</div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <div class="footer">
          <p>© 2026 PetTimer - Grow with your pet! 🎉</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (code) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px; }
        .header { text-align: center; color: #ec4899; }
        .code { font-size: 32px; font-weight: bold; color: #ec4899; text-align: center; letter-spacing: 5px; margin: 30px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">🔐 PetTimer Password Reset</h1>
        <p>You requested to reset your password. Please use the code below:</p>
        <div class="code">${code}</div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <div class="footer">
          <p>© 2026 PetTimer - Grow with your pet! 🎉</p>
        </div>
      </div>
    </body>
    </html>
  `
};

module.exports = {
  sendEmail,
  emailTemplates
};
