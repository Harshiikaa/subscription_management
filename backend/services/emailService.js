const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // For development, provide sensible defaults (Ethereal)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
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
        to,
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

  async sendSubscriptionReminderEmail(user, subscription) {
    try {
      const to = user?.email;
      if (!to) {
        return { success: false, error: "User email not found" };
      }

      const subject = `Subscription expiring on ${new Date(
        subscription.endDate
      ).toLocaleDateString()}`;
      const html = `
        <p>Hello ${user.name || "there"},</p>
        <p>Your subscription <strong>${
          subscription.productId?.name ||
          subscription.subscriptionPlanId?.name ||
          subscription._id
        }</strong> is expiring on <strong>${new Date(
        subscription.endDate
      ).toLocaleDateString()}</strong>.</p>
        <p>Billing cycle: ${subscription.billingCycle}. Amount: ${
        subscription.currency || "USD"
      } ${subscription.amount}.</p>
        <p>You can manage your subscription in the dashboard.</p>
      `;
      const text = `Your subscription is expiring on ${new Date(
        subscription.endDate
      ).toLocaleDateString()}`;

      const result = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@subscriptionapp.com",
        to,
        subject,
        text,
        html,
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending subscription reminder email:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
