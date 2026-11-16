const nodemailer = require('nodemailer');

class EmailService {
  static transporter = null;

  static async getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      // Production SMTP config
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Ethereal fake SMTP for local dev & testing
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Ethereal email test account created for development');
    }

    return this.transporter;
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail({ to, token }) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${token}`;

    const transporter = await this.getTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
          .logo { display: inline-flex; align-items: center; gap: 8px; font-weight: 800; font-size: 20px; color: #6366f1; text-decoration: none; margin-bottom: 24px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 12px; margin: 24px 0; }
          .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span>🌐 ConnectSphere</span>
          </div>
          <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #0f172a;">Password Reset Request</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            We received a request to reset your ConnectSphere account password. Click the button below to choose a new password:
          </p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">
            This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
          </p>
          <div class="footer">
            <p>If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
            <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
            <p>&copy; ${new Date().getFullYear()} ConnectSphere Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: '"ConnectSphere Security" <security@connectsphere.local>',
      to,
      subject: 'Reset your ConnectSphere password',
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 PASSWORD RESET EMAIL SENT (Ethereal Dev Preview):');
      console.log(`🔗 Preview URL: ${previewUrl}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    return { info, previewUrl };
  }
}

module.exports = EmailService;
