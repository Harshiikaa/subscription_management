const mongoose = require("mongoose");
const ManualReminder = require("./models/manualReminder");
const Subscription = require("./models/subscription");
const User = require("./models/user");
const emailService = require("./services/emailService");

async function testManualReminders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/subscription_management"
    );
    console.log("✅ Connected to MongoDB");

    // Create or get test user
    let testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      testUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
      });
      await testUser.save();
      console.log("✅ Created test user:", testUser.email);
    } else {
      console.log("✅ Using existing test user:", testUser.email);
    }

    // Create a test subscription
    const testSubscription = new Subscription({
      userId: testUser._id,
      productId: new mongoose.Types.ObjectId(),
      subscriptionType: "product",
      status: "active",
      billingCycle: "monthly",
      amount: 29.99,
      currency: "USD",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethod: "khalti",
    });
    await testSubscription.save();
    console.log("✅ Created test subscription");

    // Test 1: Create a manual reminder
    console.log("\n📝 Testing manual reminder creation...");
    const reminderData = {
      userId: testUser._id,
      subscriptionId: testSubscription._id,
      title: "Test Reminder",
      description: "This is a test reminder",
      reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      reminderTime: "10:00",
      reminderType: "email",
      customMessage: "Don't forget to check your subscription!",
      priority: "high",
      tags: ["test", "important"],
    };

    const reminder = await ManualReminder.createReminder(reminderData);
    console.log("✅ Created manual reminder:", reminder.title);

    // Test 2: Get user reminders
    console.log("\n📋 Testing get user reminders...");
    const userReminders = await ManualReminder.getUserReminders(testUser._id);
    console.log("✅ Found reminders:", userReminders.length);

    // Test 3: Check if reminder is due (should be false since it's 2 days away)
    console.log("\n⏰ Testing reminder due check...");
    const isDue = reminder.isDue();
    console.log("✅ Is reminder due:", isDue);

    // Test 4: Create a reminder that's due now
    console.log("\n🚀 Testing due reminder...");
    const dueReminderData = {
      userId: testUser._id,
      subscriptionId: testSubscription._id,
      title: "Due Reminder",
      description: "This reminder is due now",
      reminderDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      reminderTime: new Date(Date.now() - 30 * 60 * 1000)
        .toTimeString()
        .slice(0, 5), // 30 minutes ago
      reminderType: "email",
      priority: "medium",
      tags: ["urgent"],
    };

    const dueReminder = await ManualReminder.createReminder(dueReminderData);
    console.log("✅ Created due reminder:", dueReminder.title);

    // Test 5: Get due reminders
    console.log("\n🔍 Testing get due reminders...");
    const dueReminders = await ManualReminder.getDueReminders();
    console.log("✅ Found due reminders:", dueReminders.length);

    // Test 6: Send manual reminder
    console.log("\n📧 Testing manual reminder email...");
    if (dueReminders.length > 0) {
      const emailResult = await emailService.sendManualReminder(
        dueReminders[0]
      );
      console.log("✅ Email result:", emailResult);

      if (emailResult.success) {
        // Mark as sent
        await dueReminders[0].markAsSent();
        console.log("✅ Marked reminder as sent");
      }
    }

    // Test 7: Update reminder
    console.log("\n✏️ Testing reminder update...");
    const updatedReminder = await ManualReminder.findByIdAndUpdate(
      reminder._id,
      { title: "Updated Test Reminder", priority: "low" },
      { new: true }
    );
    console.log("✅ Updated reminder:", updatedReminder.title);

    // Test 8: Cancel reminder
    console.log("\n❌ Testing reminder cancellation...");
    await reminder.cancel();
    console.log("✅ Cancelled reminder");

    // Test 9: Get reminder statistics
    console.log("\n📊 Testing reminder statistics...");
    const stats = await ManualReminder.aggregate([
      { $match: { userId: testUser._id } },
      {
        $group: {
          _id: null,
          totalReminders: { $sum: 1 },
          activeReminders: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          sentReminders: {
            $sum: { $cond: [{ $eq: ["$isSent", true] }, 1, 0] },
          },
        },
      },
    ]);
    console.log("✅ Reminder statistics:", stats[0] || {});

    // Clean up test data
    await ManualReminder.deleteMany({ userId: testUser._id });
    await Subscription.deleteOne({ _id: testSubscription._id });
    await User.deleteOne({ _id: testUser._id });
    console.log("✅ Cleaned up test data");

    console.log("\n🎉 Manual reminder system test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the test
testManualReminders();
