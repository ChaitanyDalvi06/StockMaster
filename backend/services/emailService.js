// Try to load nodemailer, but make it optional
let transporter = null;

try {
  const nodemailer = require('nodemailer');
  
  // Only create transporter if email credentials are configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
      process.env.EMAIL_USER !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('✅ Email service configured');
  } else {
    console.log('⚠️  Email service not configured (skipping - optional)');
  }
} catch (error) {
  console.log('⚠️  Email service unavailable (skipping - optional):', error.message);
}

// Send OTP email
exports.sendOTPEmail = async (email, otp, name) => {
  // If email service is not configured, log OTP and return success
  if (!transporter) {
    console.log(`📧 OTP for ${email}: ${otp} (email service disabled)`);
    return true;
  }
  
  try {
    const mailOptions = {
      from: `StockMaster <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - StockMaster',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .otp-box { background-color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; border: 2px dashed #2563eb; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 StockMaster</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Your OTP Code</p>
                <p class="otp-code">${otp}</p>
              </div>
              
              <p><strong>Important:</strong> This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <p>Best regards,<br><strong>StockMaster Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StockMaster. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  // If email service is not configured, skip silently
  if (!transporter) {
    console.log(`📧 Welcome email skipped for ${email} (email service disabled)`);
    return true;
  }
  
  try {
    const mailOptions = {
      from: `StockMaster <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to StockMaster',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Welcome to StockMaster!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for registering with StockMaster - your intelligent inventory management solution.</p>
              <p>You can now start managing your inventory with features like:</p>
              <ul>
                <li>📊 Real-time inventory tracking</li>
                <li>🤖 AI-powered demand forecasting</li>
                <li>📥 Receipt and delivery management</li>
                <li>🔄 Internal stock transfers</li>
                <li>📈 Comprehensive analytics</li>
              </ul>
              <p>Get started by logging in and exploring your dashboard!</p>
              <p>Best regards,<br><strong>StockMaster Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StockMaster. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Send low stock alert
exports.sendLowStockAlert = async (email, name, products) => {
  // If email service is not configured, skip silently
  if (!transporter) {
    console.log(`📧 Low stock alert skipped for ${email} (email service disabled)`);
    return true;
  }
  
  try {
    const productList = products.map(p => 
      `<li><strong>${p.name}</strong> (SKU: ${p.sku}) - Current: ${p.currentStock}, Reorder Point: ${p.reorderPoint}</li>`
    ).join('');

    const mailOptions = {
      from: `StockMaster <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '⚠️ Low Stock Alert - StockMaster',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Low Stock Alert</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <div class="alert-box">
                <p><strong>The following products have reached their reorder points:</strong></p>
                <ul>${productList}</ul>
              </div>
              <p>Please review and create purchase orders to replenish stock.</p>
              <p>Best regards,<br><strong>StockMaster Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StockMaster. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Low stock alert sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

