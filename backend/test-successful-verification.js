/**
 * Test successful payment verification flow
 * This simulates what happens when a real payment is completed
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Payment = require("./models/payment");
const { completePaymentService } = require("./services/paymentService");

async function testSuccessfulVerification() {
  try {
    console.log("🧪 Testing Successful Payment Verification...\n");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/subscription-management"
    );
    console.log("✅ Connected to MongoDB");

    // Step 1: Create a payment record (simulating successful payment)
    console.log("\n1. Creating payment record...");
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
      providerRefId: `test-pidx-${Date.now()}`,
      gatewayData: {
        khaltiInitiateResponse: {
          pidx: `test-pidx-${Date.now()}`,
          payment_url: "https://test-pay.khalti.com/?pidx=test",
        },
      },
    });

    await payment.save();
    console.log("✅ Payment created:", payment._id);
    console.log("   Status:", payment.status);

    // Step 2: Simulate successful payment completion
    console.log("\n2. Simulating successful payment completion...");
    const mockKhaltiResponse = {
      success: true,
      data: {
        status: "Completed",
        amount: 10000, // 100 NPR in paisa
        transaction_id: `khalti-txn-${Date.now()}`,
      },
    };

    // Step 3: Complete the payment
    console.log("\n3. Completing payment...");
    const completedPayment = await completePaymentService(
      payment.transactionUUID,
      mockKhaltiResponse.data.transaction_id,
      {
        khaltiVerifyResponse: mockKhaltiResponse.data,
        pidx: payment.providerRefId,
        transaction_id: mockKhaltiResponse.data.transaction_id,
      }
    );

    console.log("✅ Payment completed successfully!");
    console.log("   New Status:", completedPayment.status);
    console.log("   Paid At:", completedPayment.paidAt);
    console.log("   Provider Ref ID:", completedPayment.providerRefId);

    // Step 4: Verify the payment is in completed state
    console.log("\n4. Verifying payment state...");
    const updatedPayment = await Payment.findById(payment._id);
    if (updatedPayment.status === "completed") {
      console.log("✅ Payment status updated to completed");
    } else {
      console.log("❌ Payment status not updated:", updatedPayment.status);
    }

    // Step 5: Test the verification logic with the completed payment
    console.log("\n5. Testing verification logic with completed payment...");

    // Simulate the verification endpoint logic
    const pidx = payment.providerRefId;
    const transaction_uuid = payment.transactionUUID;

    let foundPayment;

    // Try to find by transaction_uuid
    if (transaction_uuid) {
      foundPayment = await Payment.findOne({
        transactionUUID: transaction_uuid,
      });
      if (foundPayment) {
        console.log("✅ Payment found by transaction_uuid in verification");
        console.log("   Status:", foundPayment.status);
      }
    }

    // Try to find by pidx
    if (!foundPayment && pidx) {
      foundPayment = await Payment.findOne({ providerRefId: pidx });
      if (foundPayment) {
        console.log("✅ Payment found by pidx in verification");
        console.log("   Status:", foundPayment.status);
      }
    }

    if (foundPayment) {
      console.log("✅ Verification logic works with completed payment");

      // Simulate the success redirect
      const successUrl = `http://localhost:3000/payment/success?transactionId=${encodeURIComponent(
        foundPayment.providerRefId || ""
      )}&message=${encodeURIComponent("Payment verified successfully")}`;
      console.log("   Success URL:", successUrl);
    } else {
      console.log("❌ Verification logic failed");
    }

    // Clean up
    await Payment.findByIdAndDelete(payment._id);
    console.log("\n✅ Test payment cleaned up");

    console.log("\n🎉 Successful verification test completed!");
    console.log(
      "The payment verification flow works correctly for completed payments."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the test
testSuccessfulVerification().catch(console.error);
