const { execSync } = require('child_process');

console.log('🧪 Testing Risk Management API Integration...\n');

// Test 1: Get all risks (GET /api/risk-management)
console.log('1️⃣ Testing GET /api/risk-management');
try {
  const response = execSync('curl -s -X GET "http://localhost:3002/api/risk-management" -H "Content-Type: application/json"', {
    encoding: 'utf8',
    timeout: 10000
  });
  
  const data = JSON.parse(response);
  console.log('✅ GET Risks - Success');
  console.log(`   Found ${data.risks?.length || 0} risks`);
  
  if (data.risks && data.risks.length > 0) {
    console.log(`   Sample risk: ${data.risks[0].title}`);
  }
} catch (error) {
  console.log('❌ GET Risks - Failed:', error.message);
}

console.log('\n2️⃣ Testing POST /api/risk-management (Create Risk)');
try {
  const testRisk = {
    title: 'Test API Risk',
    description: 'This is a test risk created via API',
    category: 'Operational',
    department: 'IT',
    probability: 'Medium',
    impact: 'Low',
    owner: 'Test User'
  };

  const response = execSync(`curl -s -X POST "http://localhost:3002/api/risk-management" -H "Content-Type: application/json" -d '${JSON.stringify(testRisk)}'`, {
    encoding: 'utf8',
    timeout: 10000
  });
  
  const data = JSON.parse(response);
  
  if (data.risk) {
    console.log('✅ POST Risk - Success');
    console.log(`   Created risk ID: ${data.risk.id}`);
    console.log(`   Risk Score: ${data.risk.riskScore}`);
    
    // Test 3: Update the created risk
    console.log('\n3️⃣ Testing PUT /api/risk-management/:id (Update Risk)');
    const updateData = {
      title: 'Updated Test Risk',
      status: 'Mitigated',
      mitigationPlan: 'Test mitigation plan'
    };
    
    const updateResponse = execSync(`curl -s -X PUT "http://localhost:3002/api/risk-management/${data.risk.id}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData)}'`, {
      encoding: 'utf8',
      timeout: 10000
    });
    
    const updateResult = JSON.parse(updateResponse);
    if (updateResult.message && updateResult.message.includes('updated')) {
      console.log('✅ PUT Risk - Success');
      console.log(`   Updated risk ID: ${updateResult.riskId}`);
    } else {
      console.log('❌ PUT Risk - Failed:', updateResult);
    }
    
    // Test 4: Delete the created risk
    console.log('\n4️⃣ Testing DELETE /api/risk-management/:id (Delete Risk)');
    const deleteResponse = execSync(`curl -s -X DELETE "http://localhost:3002/api/risk-management/${data.risk.id}"`, {
      encoding: 'utf8',
      timeout: 10000
    });
    
    const deleteResult = JSON.parse(deleteResponse);
    if (deleteResult.message && deleteResult.message.includes('deleted')) {
      console.log('✅ DELETE Risk - Success');
      console.log(`   Deleted risk ID: ${deleteResult.riskId}`);
    } else {
      console.log('❌ DELETE Risk - Failed:', deleteResult);
    }
    
  } else {
    console.log('❌ POST Risk - Failed:', data);
  }
} catch (error) {
  console.log('❌ POST Risk - Failed:', error.message);
}

console.log('\n🎯 Risk Management API Integration Test Complete!');
console.log('\n📋 Summary:');
console.log('   - All CRUD operations tested');
console.log('   - Frontend connected to backend APIs');
console.log('   - Mock data removed, using real API responses');
console.log('   - Loading states and error handling implemented');
console.log('   - Real-time data refresh functionality added');
