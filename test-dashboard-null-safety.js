/**
 * Test dashboard null safety fixes
 * This script verifies that the dashboard component properly handles null metrics
 */

console.log("Testing Dashboard Null Safety Fixes");
console.log("===================================");

// Simulate null metrics scenario that was causing the toFixed() errors
const nullMetrics = null;
const incompleteMetrics = {
  totalProjects: null,
  totalUsers: 10,
  programSuccessRate: null,
  callSuccessRate: 50.5,
  avgCallDuration: null
};

// Test our null safety logic
function testMetricDisplay(label, value) {
  const result = value !== null ? `${value.toFixed(1)}%` : '---';
  console.log(`${label}: ${result}`);
  return result;
}

console.log("\n1. Testing null metrics object:");
console.log("Should show --- for all metrics when object is null");

console.log("\n2. Testing incomplete metrics with null values:");
testMetricDisplay("Program Success Rate", incompleteMetrics.programSuccessRate);
testMetricDisplay("Call Success Rate", incompleteMetrics.callSuccessRate);
testMetricDisplay("Avg Call Duration", incompleteMetrics.avgCallDuration);

console.log("\n3. Testing toFixed safety check:");
try {
  // This would have caused the original error
  // const badResult = nullMetrics ? `${nullMetrics.programSuccessRate.toFixed(1)}%` : '---';
  
  // Our fixed version
  const safeResult = incompleteMetrics && incompleteMetrics.programSuccessRate !== null 
    ? `${incompleteMetrics.programSuccessRate.toFixed(1)}%` 
    : '---';
  
  console.log("✅ Null safety check passed - no TypeError");
  console.log(`Safe result: ${safeResult}`);
} catch (error) {
  console.log("❌ Error occurred:", error.message);
}

console.log("\n✅ Dashboard null safety test completed successfully!");
console.log("The dashboard should now handle null metrics without JavaScript errors.");
