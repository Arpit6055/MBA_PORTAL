/**
 * Email Service - Handles all email operations
 * Uses Nodemailer for SMTP-based email delivery
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Initialize the email transporter
 * Supports Gmail and other SMTP providers
 */
const createTransporter = () => {
  // For Gmail: Use App Password (https://myaccount.google.com/apppasswords)
  // For other providers: Use corresponding SMTP credentials
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // Use TLS (true for 465, false for 587)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otpCode - OTP code to send
 */
const sendOTPEmail = async (email, otpCode) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your MBA Portal Login OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; border: 2px solid #667eea; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .expiry { color: #666; font-size: 14px; margin: 15px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { color: #d32f2f; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 MBA Aspirant Portal</h1>
            <p>Your One-Time Password (OTP)</p>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            <p>You requested to log in to your MBA Aspirant Portal account. Please use the OTP below to verify your email address.</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 12px;">Your One-Time Password</p>
              <div class="otp-code">${otpCode}</div>
            </div>
            
            <p class="expiry">⏰ <strong>This OTP will expire in 10 minutes.</strong></p>
            
            <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
            
            <p class="warning">⚠️ Never share your OTP with anyone. We will never ask for it.</p>
            
            <div class="footer">
              <p>© 2024 MBA Aspirant Portal. All rights reserved.</p>
              <p>Questions? Contact us at support@mbaaspirant.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your MBA Portal OTP is: ${otpCode}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (email, userName = 'User') => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to MBA Aspirant Portal! 🎓',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
          .section { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          a { color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MBA Aspirant Portal!</h1>
            <p>Your journey to the perfect MBA starts here 🚀</p>
          </div>
          
          <div class="section">
            <h3>Hello ${userName},</h3>
            <p>Thank you for registering with MBA Aspirant Portal. You're now part of a thriving community of MBA aspirants preparing for their dream business schools.</p>
          </div>
          
          <div class="section">
            <h3>📋 Next Steps:</h3>
            <ul>
              <li>Complete your profile with academic details</li>
              <li>Explore GD/PI War Room for interview prep</li>
              <li>Calculate your MBA ROI</li>
              <li>Read experiences from successful candidates</li>
            </ul>
          </div>
          
          <div class="section">
            <h3>✨ Key Features:</h3>
            <ul>
              <li><strong>GD/PI War Room:</strong> In-depth group discussion topics with arguments</li>
              <li><strong>Interview Experiences:</strong> Real stories from MBA aspirants</li>
              <li><strong>ROI Calculator:</strong> Calculate your MBA investment returns</li>
              <li><strong>Community Network:</strong> Connect with fellow aspirants</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Need help? Contact us at support@mbaaspirant.com</p>
            <p>© 2024 MBA Aspirant Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

/**
 * Test email configuration
 */
const testEmailConfiguration = async () => {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('✓ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('✗ Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  testEmailConfiguration,
  createTransporter,
};
