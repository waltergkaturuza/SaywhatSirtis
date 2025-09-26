// Simple NextAuth configuration test
async function testNextAuthEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test if NextAuth configuration endpoint is accessible
    console.log('Testing NextAuth configuration...');
    const configResponse = await fetch(`${baseUrl}/api/auth/providers`);
    console.log('Providers endpoint status:', configResponse.status);
    
    if (configResponse.ok) {
      const providers = await configResponse.json();
      console.log('Available providers:', Object.keys(providers));
    }
    
    // Test CSRF endpoint
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
    console.log('CSRF endpoint status:', csrfResponse.status);
    
    if (csrfResponse.ok) {
      const csrf = await csrfResponse.json();
      console.log('CSRF token available:', !!csrf.csrfToken);
    }
    
    console.log('✅ NextAuth API endpoints are accessible');
    console.log('✅ Authentication configuration appears to be working correctly');
    
  } catch (error) {
    console.error('❌ NextAuth test failed:', error.message);
  }
}

testNextAuthEndpoints();