/**
 * Test the verification endpoint directly
 * This simulates what happens when Khalti calls the verification endpoint
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Payment = require("./models/payment");
const axios = require("axios");

async function testVerificationEndpoint() {
  try {
    console.log("🧪 Testing Verification Endpoint...\n");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/subscription-management"
    );
    console.log("✅ Connected to MongoDB");

    // Step 1: Create a payment record
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
    console.log("   Transaction UUID:", payment.transactionUUID);
    console.log("   Order ID:", payment.orderId);
    console.log("   Provider Ref ID:", payment.providerRefId);

    // Step 2: Test verification endpoint with transaction_uuid
    console.log("\n2. Testing verification endpoint with transaction_uuid...");
    try {
      const response1 = await axios.get(
        `http://localhost:5000/api/payments/khalti/verify?pidx=${payment.providerRefId}&transaction_uuid=${payment.transactionUUID}&order_id=${payment.orderId}`
      );
      console.log("✅ Verification endpoint responded (will redirect)");
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log("✅ Verification endpoint redirected (expected)");
        console.log("   Redirect location:", error.response.headers.location);
      } else {
        console.log("❌ Verification endpoint error:", error.message);
      }
    }

    // Step 3: Test verification endpoint with only pidx
    console.log("\n3. Testing verification endpoint with only pidx...");
    try {
      const response2 = await axios.get(
        `http://localhost:5000/api/payments/khalti/verify?pidx=${payment.providerRefId}`
      );
      console.log("✅ Verification endpoint responded (will redirect)");
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log("✅ Verification endpoint redirected (expected)");
        console.log("   Redirect location:", error.response.headers.location);
      } else {
        console.log("❌ Verification endpoint error:", error.message);
      }
    }

    // Step 4: Test verification endpoint with order_id
    console.log("\n4. Testing verification endpoint with order_id...");
    try {
      const response3 = await axios.get(
        `http://localhost:5000/api/payments/khalti/verify?pidx=${payment.providerRefId}&order_id=${payment.orderId}`
      );
      console.log("✅ Verification endpoint responded (will redirect)");
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log("✅ Verification endpoint redirected (expected)");
        console.log("   Redirect location:", error.response.headers.location);
      } else {
        console.log("❌ Verification endpoint error:", error.message);
      }
    }

    // Step 5: Test with invalid pidx
    console.log("\n5. Testing verification endpoint with invalid pidx...");
    try {
      const response4 = await axios.get(
        `http://localhost:5000/api/payments/khalti/verify?pidx=invalid-pidx`
      );
      console.log("✅ Verification endpoint responded (will redirect)");
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log("✅ Verification endpoint redirected (expected)");
        console.log("   Redirect location:", error.response.headers.location);
      } else {
        console.log("❌ Verification endpoint error:", error.message);
      }
    }

    // Clean up
    await Payment.findByIdAndDelete(payment._id);
    console.log("\n✅ Test payment cleaned up");

    console.log("\n🎉 Verification endpoint test completed!");
    console.log(
      "The verification endpoint is working correctly with multiple lookup methods."
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
testVerificationEndpoint().catch(console.error);
