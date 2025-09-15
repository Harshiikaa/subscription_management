const mongoose = require("mongoose");
const ReminderPreferences = require("./models/reminderPreferences");
const Subscription = require("./models/subscription");
const User = require("./models/user");
const emailService = require("./services/emailService");

async function testReminderSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/subscription_management"
    );
    console.log("✅ Connected to MongoDB");

    // Create a test user
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
    });
    await testUser.save();
    console.log("✅ Created test user:", testUser.email);

    // Create reminder preferences for the user
    const preferences = new ReminderPreferences({
      userId: testUser._id,
      subscriptionExpiryReminder: {
        enabled: true,
        daysBeforeExpiry: 10,
      },
      emailNotifications: {
        enabled: true,
        email: testUser.email,
      },
      smsNotifications: {
        enabled: false,
      },
    });
    await preferences.save();
    console.log("✅ Created reminder preferences");

    // Create a test subscription that expires in 5 days (should trigger reminder)
    const testSubscription = new Subscription({
      userId: testUser._id,
      productId: new mongoose.Types.ObjectId(),
      subscriptionType: "product",
      status: "active",
      billingCycle: "monthly",
      amount: 29.99,
      currency: "USD",
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      paymentMethod: "khalti",
    });
    await testSubscription.save();
    console.log("✅ Created test subscription expiring in 5 days");

    // Test the reminder logic
    const shouldSendReminder = preferences.shouldSendReminder(
      testSubscription.endDate
    );
    console.log("✅ Should send reminder:", shouldSendReminder);

    if (shouldSendReminder) {
      // Test email sending (this will use ethereal email for testing)
      console.log("📧 Testing email sending...");
      const emailResult = await emailService.sendSubscriptionExpiryReminder(
        testUser,
        testSubscription
      );
      console.log("✅ Email result:", emailResult);
    }

    // Test the reminder preferences API
    console.log("\n📊 Testing reminder preferences...");
    const userPreferences = await ReminderPreferences.getUserPreferences(
      testUser._id
    );
    console.log("✅ User preferences:", userPreferences);

    // Clean up test data
    await Subscription.deleteOne({ _id: testSubscription._id });
    await ReminderPreferences.deleteOne({ _id: preferences._id });
    await User.deleteOne({ _id: testUser._id });
    console.log("✅ Cleaned up test data");

    console.log("\n🎉 Reminder system test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the test
testReminderSystem();
