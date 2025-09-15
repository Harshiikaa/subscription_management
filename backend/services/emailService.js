const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // For development, we'll use a test account
    // In production, configure with your actual SMTP settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "ethereal.user@ethereal.email",
        pass: process.env.SMTP_PASS || "ethereal.pass",
      },
    });
  }

  async sendSubscriptionExpiryReminder(user, subscription) {
    try {
      const reminderDate = new Date(subscription.endDate);
      reminderDate.setDate(reminderDate.getDate() - 10); // 10 days before expiry

      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@subscriptionapp.com",
        to: user.email,
        subject: `Subscription Expiring Soon - ${
          subscription.productId?.name ||
          subscription.subscriptionPlanId?.name ||
          "Your Subscription"
        }`,
        html: this.generateReminderEmailHTML(user, subscription),
        text: this.generateReminderEmailText(user, subscription),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Reminder email sent:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending reminder email:", error);
      return { success: false, error: error.message };
    }
  }

  generateReminderEmailHTML(user, subscription) {
    const expiryDate = new Date(subscription.endDate).toLocaleDateString();
    const daysLeft = Math.ceil(
      (subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Expiring Soon</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Subscription Expiring Soon</h1>
          </div>
          <div class="content">
            <p>Hello ${user.name || "Valued Customer"},</p>
            
            <p>We wanted to remind you that your subscription is expiring soon:</p>
            
            <ul>
              <li><strong>Subscription:</strong> ${
                subscription.productId?.name ||
                subscription.subscriptionPlanId?.name ||
                "Your Subscription"
              }</li>
              <li><strong>Expiry Date:</strong> ${expiryDate}</li>
              <li><strong>Days Remaining:</strong> ${daysLeft} days</li>
              <li><strong>Billing Cycle:</strong> ${
                subscription.billingCycle
              }</li>
              <li><strong>Amount:</strong> ${subscription.currency} ${
      subscription.amount
    }</li>
            </ul>
            
            <p>To continue enjoying our services, please renew your subscription before it expires.</p>
            
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/dashboard/subscriptions" class="button">
              Renew Subscription
            </a>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>This is an automated reminder. Please do not reply to this email.</p>
            <p>© 2024 Subscription Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateReminderEmailText(user, subscription) {
    const expiryDate = new Date(subscription.endDate).toLocaleDateString();
    const daysLeft = Math.ceil(
      (subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    return `
Subscription Expiring Soon

Hello ${user.name || "Valued Customer"},

We wanted to remind you that your subscription is expiring soon:

Subscription: ${
      subscription.productId?.name ||
      subscription.subscriptionPlanId?.name ||
      "Your Subscription"
    }
Expiry Date: ${expiryDate}
Days Remaining: ${daysLeft} days
Billing Cycle: ${subscription.billingCycle}
Amount: ${subscription.currency} ${subscription.amount}

To continue enjoying our services, please renew your subscription before it expires.

Visit: ${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/dashboard/subscriptions

If you have any questions or need assistance, please don't hesitate to contact our support team.

This is an automated reminder. Please do not reply to this email.
© 2024 Subscription Management System. All rights reserved.
    `;
  }

  async sendManualReminder(reminder) {
    try {
      const user = reminder.userId;
      const subscription = reminder.subscriptionId;

      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@subscriptionapp.com",
        to: user.email,
        subject: `Reminder: ${reminder.title}`,
        html: this.generateManualReminderEmailHTML(
          user,
          subscription,
          reminder
        ),
        text: this.generateManualReminderEmailText(
          user,
          subscription,
          reminder
        ),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Manual reminder email sent:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending manual reminder email:", error);
      return { success: false, error: error.message };
    }
  }

  generateManualReminderEmailHTML(user, subscription, reminder) {
    const subscriptionName =
      subscription.productId?.name ||
      subscription.subscriptionPlanId?.name ||
      "Your Subscription";
    const reminderDateTime = reminder.fullReminderDateTime.toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reminder.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .priority-high { background: #dc3545; color: white; }
          .priority-medium { background: #ffc107; color: black; }
          .priority-low { background: #28a745; color: white; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #666; }
          .tags { margin: 10px 0; }
          .tag { display: inline-block; background: #e9ecef; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 ${reminder.title}</h1>
            <div class="priority priority-${reminder.priority}">
              ${reminder.priority.toUpperCase()} PRIORITY
            </div>
          </div>
          <div class="content">
            <p>Hello ${user.name || "Valued Customer"},</p>
            
            <p>This is a reminder you set for your subscription:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
              <h3>Subscription Details</h3>
              <ul>
                <li><strong>Subscription:</strong> ${subscriptionName}</li>
                <li><strong>Billing Cycle:</strong> ${
                  subscription.billingCycle
                }</li>
                <li><strong>Amount:</strong> ${subscription.currency} ${
      subscription.amount
    }</li>
                <li><strong>Expiry Date:</strong> ${new Date(
                  subscription.endDate
                ).toLocaleDateString()}</li>
              </ul>
            </div>
            
            ${
              reminder.description
                ? `<p><strong>Description:</strong> ${reminder.description}</p>`
                : ""
            }
            
            ${
              reminder.customMessage
                ? `<div style="background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 15px 0;">
              <strong>Your Custom Message:</strong><br>
              ${reminder.customMessage}
            </div>`
                : ""
            }
            
            <p><strong>Reminder Time:</strong> ${reminderDateTime}</p>
            
            ${
              reminder.tags && reminder.tags.length > 0
                ? `
              <div class="tags">
                <strong>Tags:</strong>
                ${reminder.tags
                  .map((tag) => `<span class="tag">${tag}</span>`)
                  .join("")}
              </div>
            `
                : ""
            }
            
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/dashboard/subscriptions" class="button">
              Manage Subscription
            </a>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>This is a manual reminder you created. You can manage your reminders in the dashboard.</p>
            <p>© 2024 Subscription Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateManualReminderEmailText(user, subscription, reminder) {
    const subscriptionName =
      subscription.productId?.name ||
      subscription.subscriptionPlanId?.name ||
      "Your Subscription";
    const reminderDateTime = reminder.fullReminderDateTime.toLocaleString();

    return `
${reminder.title} - ${reminder.priority.toUpperCase()} PRIORITY

Hello ${user.name || "Valued Customer"},

This is a reminder you set for your subscription:

SUBSCRIPTION DETAILS:
- Subscription: ${subscriptionName}
- Billing Cycle: ${subscription.billingCycle}
- Amount: ${subscription.currency} ${subscription.amount}
- Expiry Date: ${new Date(subscription.endDate).toLocaleDateString()}

${reminder.description ? `Description: ${reminder.description}\n` : ""}
${
  reminder.customMessage
    ? `Your Custom Message: ${reminder.customMessage}\n`
    : ""
}

Reminder Time: ${reminderDateTime}
${
  reminder.tags && reminder.tags.length > 0
    ? `Tags: ${reminder.tags.join(", ")}\n`
    : ""
}

Manage your subscription: ${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/dashboard/subscriptions

If you have any questions or need assistance, please don't hesitate to contact our support team.

This is a manual reminder you created. You can manage your reminders in the dashboard.
© 2024 Subscription Management System. All rights reserved.
    `;
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
