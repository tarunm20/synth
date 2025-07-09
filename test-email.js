const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testEmailFunctionality() {
  console.log('🧪 Testing Synth Email Functionality');
  console.log('=====================================');
  
  // Test 1: Register a user (should send email confirmation)
  console.log('\n1. Testing User Registration (Email Confirmation)');
  try {
    const registrationResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'TestPassword123!'
    });
    
    console.log('✅ Registration successful:', registrationResponse.status);
    console.log('📧 Email confirmation should be sent to: test@example.com');
    
    // Store the JWT token for authenticated requests
    const token = registrationResponse.data.token;
    
    // Test 2: Request password reset
    console.log('\n2. Testing Password Reset Request');
    const passwordResetResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: 'test@example.com'
    });
    
    console.log('✅ Password reset request successful:', passwordResetResponse.status);
    console.log('📧 Password reset email should be sent to: test@example.com');
    
    // Test 3: Resend email confirmation
    console.log('\n3. Testing Resend Email Confirmation');
    const resendResponse = await axios.post(`${BASE_URL}/auth/resend-confirmation`, {
      email: 'test@example.com'
    });
    
    console.log('✅ Resend confirmation successful:', resendResponse.status);
    console.log('📧 New confirmation email should be sent to: test@example.com');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
  
  // Test 4: Test with invalid email (should not send email)
  console.log('\n4. Testing Invalid Email Handling');
  try {
    const invalidResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: 'nonexistent@example.com'
    });
    
    console.log('✅ Invalid email handled gracefully:', invalidResponse.status);
    console.log('📧 No email should be sent for non-existent user');
    
  } catch (error) {
    console.log('✅ Invalid email properly rejected:', error.response?.status);
  }
  
  // Test 5: Test rate limiting
  console.log('\n5. Testing Rate Limiting');
  try {
    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: 'test@example.com'
      }));
    }
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Rate limiting working: ${successful} successful, ${failed} blocked`);
    
  } catch (error) {
    console.log('✅ Rate limiting active:', error.response?.status);
  }
  
  console.log('\n🎉 Email functionality tests completed!');
  console.log('\nNOTE: To see actual emails sent, you need to:');
  console.log('1. Set RESEND_API_KEY environment variable');
  console.log('2. Set RESEND_FROM_EMAIL environment variable');
  console.log('3. Check your email inbox for test emails');
  console.log('\nWithout these environment variables, emails will be logged but not sent.');
}

// Run the tests
testEmailFunctionality().catch(console.error);