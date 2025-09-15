const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // For development, we'll use a test account
    // In production, configure with your actual SMTP settings
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "ethereal.user@ethereal.email",
        pass: process.env.SMTP_PASS || "ethereal.pass",
      },
    });
  }

  async sendTestEmail(to) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@subscriptionapp.com",
        to: to,
        subject: "Test Email - Subscription Management System",
        text: "This is a test email to verify email functionality.",
        html: "<p>This is a test email to verify email functionality.</p>",
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending test email:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
