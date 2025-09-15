# Subscription Reminder System

This document describes the comprehensive reminder system implemented using Agenda for cron jobs and Nodemailer for email notifications.

## Overview

The reminder system automatically sends email notifications to users before their subscriptions expire. Users can configure their reminder preferences to choose between 10 or 15 days before expiry.

## Features

- ✅ **Configurable Reminder Timing**: Users can choose 10 or 15 days before expiry
- ✅ **Email Notifications**: HTML and text email templates
- ✅ **User Preferences**: Individual reminder settings per user
- ✅ **Cron Jobs**: Automated daily checks using Agenda
- ✅ **Test Email**: Users can send test emails to verify settings
- ✅ **Admin Statistics**: View reminder system statistics
- ✅ **Automatic Scheduling**: Reminders are scheduled when subscriptions are created

## Architecture

### Backend Components

1. **Models**

   - `ReminderPreferences`: User reminder settings
   - `Subscription`: Enhanced with reminder scheduling
   - `User`: User information for notifications

2. **Services**

   - `emailService`: Handles email sending with Nodemailer
   - `agendaConfig`: Manages cron jobs and scheduling
   - `subscriptionService`: Enhanced with reminder scheduling

3. **Controllers & Routes**

   - `reminderController`: API endpoints for preferences
   - `reminderRoute`: RESTful API routes

4. **Cron Jobs**
   - Daily subscription expiry check (9 AM)
   - Daily cleanup of expired subscriptions (11 PM)
   - Development mode: Every 5 minutes for testing

### Frontend Components

1. **ReminderPreferences**: React component for managing settings
2. **Billing Page**: Integrated reminder preferences tab

## API Endpoints

### User Endpoints (Authentication Required)

#### Get Reminder Preferences

```http
GET /api/reminders/preferences
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "subscriptionExpiryReminder": {
      "enabled": true,
      "daysBeforeExpiry": 10
    },
    "emailNotifications": {
      "enabled": true,
      "email": "user@example.com"
    },
    "smsNotifications": {
      "enabled": false,
      "phoneNumber": ""
    },
    "lastReminderSent": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Reminder Preferences

```http
PUT /api/reminders/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "subscriptionExpiryReminder": {
    "enabled": true,
    "daysBeforeExpiry": 15
  },
  "emailNotifications": {
    "enabled": true,
    "email": "newemail@example.com"
  }
}
```

#### Send Test Email

```http
POST /api/reminders/test-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Admin Endpoints

#### Get Reminder Statistics

```http
GET /api/reminders/stats
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "emailEnabled": 120,
    "smsEnabled": 0,
    "reminderEnabled": 110,
    "tenDayReminders": 80,
    "fifteenDayReminders": 30
  }
}
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# MongoDB (for Agenda)
MONGODB_URI=mongodb://localhost:27017/subscription_management
```

### Email Templates

The system includes both HTML and text email templates with:

- Professional styling
- Subscription details
- Expiry information
- Renewal links
- Company branding

## Usage

### For Users

1. **Access Reminder Settings**

   - Go to Dashboard → Billing → Reminders tab
   - Configure your preferences

2. **Set Reminder Timing**

   - Choose between 10 or 15 days before expiry
   - Enable/disable email notifications

3. **Test Email**
   - Use the test email button to verify settings
   - Check your inbox for the test message

### For Developers

1. **Start the System**

   ```bash
   cd backend
   npm start
   ```

2. **Test the System**

   ```bash
   node test-reminder-system.js
   ```

3. **Monitor Logs**
   - Check console for Agenda job execution
   - Monitor email sending status
   - View reminder statistics

## Cron Job Schedule

- **9:00 AM Daily**: Check for expiring subscriptions and send reminders
- **11:00 PM Daily**: Clean up expired subscriptions
- **Development**: Every 5 minutes for testing

## Email Service

### Features

- HTML and text email templates
- Professional styling
- Subscription details
- Expiry countdown
- Renewal links
- Error handling and logging

### Testing

- Uses Ethereal Email for development
- Test email functionality included
- Production-ready SMTP configuration

## Database Schema

### ReminderPreferences

```javascript
{
  userId: ObjectId,
  subscriptionExpiryReminder: {
    enabled: Boolean,
    daysBeforeExpiry: Number // 10 or 15
  },
  emailNotifications: {
    enabled: Boolean,
    email: String
  },
  smsNotifications: {
    enabled: Boolean,
    phoneNumber: String
  },
  lastReminderSent: Date
}
```

## Error Handling

- Graceful email sending failures
- Database connection errors
- Invalid user preferences
- Missing subscription data
- SMTP configuration errors

## Monitoring

- Console logging for all operations
- Email sending status tracking
- Job execution monitoring
- Error reporting and debugging

## Future Enhancements

- [ ] SMS notifications
- [ ] Push notifications
- [ ] Multiple reminder intervals
- [ ] Custom email templates
- [ ] Reminder analytics dashboard
- [ ] Webhook notifications

## Troubleshooting

### Common Issues

1. **Emails not sending**

   - Check SMTP configuration
   - Verify email credentials
   - Check spam folder

2. **Reminders not scheduled**

   - Verify Agenda is running
   - Check MongoDB connection
   - Review user preferences

3. **Cron jobs not executing**
   - Check Agenda initialization
   - Verify job scheduling
   - Monitor console logs

### Debug Commands

```bash
# Test email service
node -e "require('./services/emailService').sendTestEmail('test@example.com')"

# Check Agenda status
node -e "require('./configs/agenda').getAgenda().then(agenda => console.log(agenda._definitions))"

# Test reminder logic
node test-reminder-system.js
```

## Security Considerations

- Email addresses are validated
- User authentication required
- Rate limiting on email sending
- Secure SMTP configuration
- Input validation and sanitization

## Performance

- Efficient database queries
- Batch email processing
- Optimized cron job execution
- Minimal memory usage
- Scalable architecture

This reminder system provides a robust, user-friendly solution for subscription expiry notifications with comprehensive configuration options and professional email templates.
