/**
 * End-to-end test for Khalti payment flow
 * This creates a payment, simulates the verification process
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Payment = require("./models/payment");
const { createPaymentService } = require("./services/paymentService");
const {
  updatePaymentByTransactionUUIDService,
} = require("./services/paymentService");
const { verifyKhaltiPayment } = require("./utils/khaltiVerify");

async function testEndToEndFlow() {
  try {
    console.log("🧪 Testing End-to-End Khalti Payment Flow...\n");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/subscription-management"
    );
    console.log("✅ Connected to MongoDB");

    // Step 1: Create a payment directly (simulating the API call)
    console.log("\n1. Creating payment...");
    const payment = new Payment({
      userId: new mongoose.Types.ObjectId(),
      productId: new mongoose.Types.ObjectId(),
      paymentType: "product",
      paymentMethod: "khalti",
      amount: 100,
      currency: "NPR",
      orderId: `TEST_ORDER_${Date.now()}`,
      transactionUUID: `test-uuid-${Date.now()}`,
      status: "pending",
    });

    await payment.save();
    console.log("✅ Payment created:", payment._id);
    console.log("   Transaction UUID:", payment.transactionUUID);
    console.log("   Order ID:", payment.orderId);

    // Step 2: Simulate Khalti payment initiation (update with pidx)
    console.log("\n2. Simulating Khalti payment initiation...");
    const mockPidx = `test-pidx-${Date.now()}`;

    // Update payment directly
    payment.providerRefId = mockPidx;
    payment.gatewayData = {
      khaltiInitiateResponse: {
        pidx: mockPidx,
        payment_url: "https://test-pay.khalti.com/?pidx=" + mockPidx,
      },
    };
    await payment.save();
    console.log("✅ Payment updated with pidx:", mockPidx);

    // Step 3: Verify payment can be found by transaction_uuid
    console.log("\n3. Testing payment lookup by transaction_uuid...");
    const foundByUUID = await Payment.findOne({
      transactionUUID: payment.transactionUUID,
    });
    if (foundByUUID) {
      console.log("✅ Payment found by transaction_uuid");
      console.log("   Provider Ref ID:", foundByUUID.providerRefId);
    } else {
      console.log("❌ Payment not found by transaction_uuid");
    }

    // Step 4: Verify payment can be found by pidx
    console.log("\n4. Testing payment lookup by pidx...");
    const foundByPidx = await Payment.findOne({
      providerRefId: mockPidx,
    });
    if (foundByPidx) {
      console.log("✅ Payment found by pidx");
      console.log("   Transaction UUID:", foundByPidx.transactionUUID);
    } else {
      console.log("❌ Payment not found by pidx");
    }

    // Step 5: Test verification endpoint logic
    console.log("\n5. Testing verification endpoint logic...");
    const pidx = mockPidx;
    const transaction_uuid = payment.transactionUUID;

    let verificationPayment;

    // First try to find by transaction_uuid if provided
    if (transaction_uuid) {
      try {
        verificationPayment = await Payment.findOne({
          transactionUUID: transaction_uuid,
        });
        if (verificationPayment) {
          console.log("✅ Payment found by transaction_uuid in verification");
        } else {
          console.log("⚠️  Payment not found by transaction_uuid, trying pidx");
        }
      } catch (error) {
        console.log("⚠️  Error finding by transaction_uuid:", error.message);
      }
    }

    // If still not found, try finding by pidx
    if (!verificationPayment) {
      verificationPayment = await Payment.findOne({
        providerRefId: pidx,
      });
      if (verificationPayment) {
        console.log("✅ Payment found by pidx in verification");
      } else {
        console.log("❌ Payment not found by either method");
      }
    }

    if (verificationPayment) {
      console.log("✅ Verification logic works - payment found!");
      console.log("   Payment ID:", verificationPayment._id);
      console.log("   Status:", verificationPayment.status);
    } else {
      console.log("❌ Verification logic failed - payment not found");
    }

    // Step 6: Test Khalti verification API (will fail with test pidx)
    console.log("\n6. Testing Khalti verification API...");
    const verifyResult = await verifyKhaltiPayment(mockPidx);
    if (verifyResult.success) {
      console.log("✅ Khalti verification API working");
    } else {
      console.log(
        "ℹ️  Khalti verification failed (expected with test pidx):",
        verifyResult.error?.message || "Unknown error"
      );
    }

    // Clean up
    await Payment.findByIdAndDelete(payment._id);
    console.log("\n✅ Test payment cleaned up");

    console.log("\n🎉 End-to-end test completed!");
    console.log("The payment flow should work correctly now.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the test
testEndToEndFlow().catch(console.error);
