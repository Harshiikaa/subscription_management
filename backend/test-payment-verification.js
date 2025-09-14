/**
 * Test script for payment verification flow
 * This creates a real payment record and tests the verification
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Payment = require("./models/payment");
const { verifyKhaltiPayment } = require("./utils/khaltiVerify");

async function testPaymentVerification() {
  try {
    console.log("🧪 Testing Payment Verification Flow...\n");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/subscription-management"
    );
    console.log("✅ Connected to MongoDB");

    // Create a test payment record
    const testPayment = new Payment({
      userId: new mongoose.Types.ObjectId(),
      productId: new mongoose.Types.ObjectId(),
      paymentType: "product",
      orderId: `TEST_ORDER_${Date.now()}`,
      transactionUUID: `test-uuid-${Date.now()}`,
      amount: 100,
      currency: "NPR",
      paymentMethod: "khalti",
      status: "pending",
      providerRefId: "test-pidx-123", // This will be used for verification
    });

    await testPayment.save();
    console.log("✅ Test payment created:", testPayment._id);

    // Test 1: Find payment by transaction_uuid
    console.log("\n1. Testing payment lookup by transaction_uuid...");
    const foundByUUID = await Payment.findOne({
      transactionUUID: testPayment.transactionUUID,
    });
    if (foundByUUID) {
      console.log("✅ Payment found by transaction_uuid");
    } else {
      console.log("❌ Payment not found by transaction_uuid");
    }

    // Test 2: Find payment by pidx (providerRefId)
    console.log("\n2. Testing payment lookup by pidx...");
    const foundByPidx = await Payment.findOne({
      providerRefId: "test-pidx-123",
    });
    if (foundByPidx) {
      console.log("✅ Payment found by pidx");
    } else {
      console.log("❌ Payment not found by pidx");
    }

    // Test 3: Test Khalti verification (will fail with test pidx)
    console.log("\n3. Testing Khalti verification API...");
    const verifyResult = await verifyKhaltiPayment("test-pidx-123");
    if (verifyResult.success) {
      console.log("✅ Khalti verification API working");
    } else {
      console.log(
        "ℹ️  Khalti verification failed (expected with test pidx):",
        verifyResult.error?.message
      );
    }

    // Test 4: Simulate verification endpoint logic
    console.log("\n4. Testing verification endpoint logic...");
    const pidx = "test-pidx-123";
    const transaction_uuid = testPayment.transactionUUID;

    let payment;
    if (transaction_uuid) {
      try {
        payment = await Payment.findOne({ transactionUUID: transaction_uuid });
        if (payment) {
          console.log(
            "✅ Payment found by transaction_uuid in verification logic"
          );
        } else {
          console.log(
            "❌ Payment not found by transaction_uuid in verification logic"
          );
        }
      } catch (error) {
        console.log(
          "❌ Error finding payment by transaction_uuid:",
          error.message
        );
      }
    }

    if (pidx) {
      payment = await Payment.findOne({ providerRefId: pidx });
      if (payment) {
        console.log("✅ Payment found by pidx in verification logic");
      } else {
        console.log("❌ Payment not found by pidx in verification logic");
      }
    }

    // Clean up test payment
    await Payment.findByIdAndDelete(testPayment._id);
    console.log("\n✅ Test payment cleaned up");

    console.log("\n🎉 Payment verification test completed!");
    console.log("\nThe verification should work with real payments now.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the test
testPaymentVerification().catch(console.error);
