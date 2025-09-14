// Simple test to verify subscription plans API is working
const API_URL = 'http://localhost:5000/api/subscription-plans';

async function testAPI() {
  try {
    console.log('🧪 Testing Subscription Plans API...');
    
    const response = await fetch(API_URL);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API is working!');
      console.log(`📊 Found ${data.data.items.length} subscription plans`);
      console.log('📋 Plans:');
      data.data.items.forEach(plan => {
        console.log(`   - ${plan.name}: ${plan.pricing.currency} ${plan.pricing.monthly}/month`);
      });
    } else {
      console.log('❌ API Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Connection Error:', error.message);
    console.log('💡 Make sure the backend server is running on port 5000');
  }
}

testAPI();
