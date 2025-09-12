/**
 * Test Supervisors API
 */

async function testSupervisorsAPI() {
  try {
    console.log('🔍 Testing Supervisors API...\n');
    
    const response = await fetch('http://localhost:3000/api/hr/employees/supervisors');
    const result = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ API Success!');
      console.log('Supervisors Count:', result.data?.length || 0);
    } else {
      console.log('\n❌ API Failed:');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('\n💥 Test Error:', error.message);
  }
}

testSupervisorsAPI();
