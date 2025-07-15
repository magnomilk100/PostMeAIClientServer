// Test script to demonstrate authentication toggle
const { authConfig } = require('./server/authConfig');

console.log('🔧 Authentication Configuration Test');
console.log('=====================================');
console.log('AUTH_ENABLED environment variable:', process.env.AUTH_ENABLED);
console.log('Authentication status:', authConfig.enabled ? 'ENABLED' : 'DISABLED');

if (authConfig.enabled) {
  console.log('🔐 Full authentication system is active');
  console.log('- Users must login with OAuth providers');
  console.log('- Session management is enabled');
  console.log('- Protected routes require authentication');
  console.log('- Onboarding flow is triggered for new users');
} else {
  console.log('🔓 Anonymous mode is active');
  console.log('- All users are treated as anonymous');
  console.log('- No login/registration required');
  console.log('- All features are immediately accessible');
  console.log('- Onboarding is skipped');
  console.log('- Default user profile:', authConfig.defaultUser);
}

console.log('\n📋 To change authentication mode:');
console.log('1. Set AUTH_ENABLED=true in your .env file to enable auth');
console.log('2. Set AUTH_ENABLED=false in your .env file to disable auth');
console.log('3. Restart the application');
console.log('4. Check server console for confirmation');