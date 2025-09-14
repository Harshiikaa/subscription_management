/**
 * Test script for Khalti payment integration
 * Run with: node test-khalti.js
 */

require("dotenv").config();
const initiateKhaltiPayment = require("./utils/khaltiInitiate");
const { verifyKhaltiPayment } = require("./utils/khaltiVerify");

async function testKhaltiIntegration() {
  console.log("🧪 Testing Khalti Payment Integration...\n");

  // Test 1: Check environment variables
  console.log("1. Checking environment variables...");
  const requiredEnvVars = [
    "KHALTI_SECRET_KEY",
    "KHALTI_PUBLIC_KEY",
    "KHALTI_BASE_URL",
    "KHALTI_VERIFY_URL",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.log("❌ Missing environment variables:", missingVars.join(", "));
    console.log("Please add these to your .env file");
    return;
  }
  console.log("✅ All required environment variables are set\n");

  // Test 2: Test payment initiation
  console.log("2. Testing payment initiation...");
  try {
    const testPaymentData = {
      return_url:
        "http://localhost:5000/api/payments/khalti/verify?transaction_uuid=test-uuid-123",
      website_url: "http://localhost:3000",
      amount: 100, // 100 NPR
      purchase_order_id: "TEST_ORDER_123",
      purchase_order_name: "Test Payment",
      customer_info: {
        name: "Test User",
        email: "test@example.com",
        phone: "9841234567",
      },
      amount_breakdown: {
        subtotal: 100,
        tax: 0,
        shipping: 0,
        discount: 0,
      },
    };

    const initiateResult = await initiateKhaltiPayment(testPaymentData);

    if (initiateResult.success) {
      console.log("✅ Payment initiation successful");
      console.log("   Payment URL:", initiateResult.data.payment_url);
      console.log("   Pidx:", initiateResult.data.pidx);
    } else {
      console.log("❌ Payment initiation failed:", initiateResult.error);
    }
  } catch (error) {
    console.log("❌ Payment initiation error:", error.message);
  }

  console.log("\n3. Testing payment verification...");
  console.log(
    "   Note: This will fail with a test pidx, but shows the API is working"
  );

  try {
    const verifyResult = await verifyKhaltiPayment("test-pidx-123");

    if (verifyResult.success) {
      console.log("✅ Payment verification API is working");
      console.log("   Status:", verifyResult.data.status);
    } else {
      console.log(
        "ℹ️  Payment verification failed (expected with test pidx):",
        verifyResult.error?.message || "Unknown error"
      );
    }
  } catch (error) {
    console.log(
      "ℹ️  Payment verification error (expected with test pidx):",
      error.message
    );
  }

  console.log("\n🎉 Khalti integration test completed!");
  console.log("\nNext steps:");
  console.log("1. Add your Khalti credentials to .env file");
  console.log("2. Install dependencies: npm install");
  console.log("3. Start the server: npm run dev");
  console.log("4. Test with real payment data");
}

// Run the test
testKhaltiIntegration().catch(console.error);
