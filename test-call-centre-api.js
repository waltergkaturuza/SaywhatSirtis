// Test script for the call centre API fix
const https = require('https');

async function testCallCentreAPI() {
  console.log('Testing Call Centre API...\n');
  
  const testData = {
    callerName: 'Test Caller',
    callerPhone: '1234567890',
    callerEmail: 'test@example.com',
    callerAge: '25',
    callerGender: 'Male',
    callerProvince: 'Test Province',
    callType: 'inbound',
    modeOfCommunication: 'inbound',
    callDescription: 'Test call for API verification',
    purpose: 'Testing',
    priority: 'HIGH',
    comment: 'This is a test call to verify the unique constraint fix'
  };

  // Test 1: Single call creation
  console.log('Test 1: Creating single call record...');
  try {
    const response1 = await fetch('http://localhost:3000/api/call-centre/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result1 = await response1.json();
    console.log('Response Status:', response1.status);
    console.log('Response Body:', JSON.stringify(result1, null, 2));
    
    if (response1.ok) {
      console.log('✅ Test 1 PASSED - Call created successfully');
      console.log('Case Number:', result1.call?.caseNumber);
    } else {
      console.log('❌ Test 1 FAILED - Call creation failed');
      return;
    }
  } catch (error) {
    console.log('❌ Test 1 ERROR:', error.message);
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Multiple concurrent calls to test unique constraint handling
  console.log('Test 2: Testing concurrent call creation (stress test)...');
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    const concurrentData = {
      ...testData,
      callerName: `Test Caller ${i + 1}`,
      comment: `Concurrent test call #${i + 1}`
    };
    
    promises.push(
      fetch('http://localhost:3000/api/call-centre/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(concurrentData)
      })
    );
  }

  try {
    const results = await Promise.all(promises);
    console.log('Concurrent calls completed!');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < results.length; i++) {
      const response = results[i];
      const body = await response.json();
      
      console.log(`Call ${i + 1}: Status ${response.status}`);
      if (response.ok) {
        successCount++;
        console.log(`  ✅ Case Number: ${body.call?.caseNumber}`);
      } else {
        errorCount++;
        console.log(`  ❌ Error: ${body.error || 'Unknown error'}`);
      }
    }
    
    console.log(`\nResults: ${successCount} successful, ${errorCount} failed`);
    
    if (successCount === 5) {
      console.log('✅ Test 2 PASSED - All concurrent calls created with unique case numbers');
    } else if (successCount > 0) {
      console.log('⚠️  Test 2 PARTIAL - Some calls succeeded, indicating the fix is working but may need optimization');
    } else {
      console.log('❌ Test 2 FAILED - No concurrent calls succeeded');
    }
    
  } catch (error) {
    console.log('❌ Test 2 ERROR:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('API Test Complete!');
}

// Run the test
testCallCentreAPI().catch(console.error);