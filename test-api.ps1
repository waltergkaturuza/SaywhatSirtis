$body = @'
{
  "callerPhoneNumber": "+1234567890",
  "callerEmail": "test@example.com",
  "callerFullName": "Test User",
  "priority": "HIGH",
  "category": "COMPLAINT",
  "clientGender": "Female",
  "district": "Test District",
  "ward": "Test Ward",
  "resolution": "Test resolution",
  "satisfactionRating": "5",
  "issueDescription": "Testing all new fields",
  "additionalNotes": "Comprehensive test of enhanced form"
}
'@

Write-Host "🧪 Testing enhanced call centre API..."

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/call-centre/calls' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API call successful!" -ForegroundColor Green
        Write-Host "📋 Response:" -ForegroundColor Cyan
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
    } else {
        Write-Host "❌ API call failed with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error calling API: $($_.Exception.Message)" -ForegroundColor Red
}

# Test retrieving calls
Write-Host "`n🔍 Testing retrieval of calls..."
try {
    $getResponse = Invoke-WebRequest -Uri 'http://localhost:3001/api/call-centre/calls' -Method GET
    
    if ($getResponse.StatusCode -eq 200) {
        Write-Host "✅ Retrieval successful!" -ForegroundColor Green
        $calls = $getResponse.Content | ConvertFrom-Json
        Write-Host "📊 Found $($calls.Count) calls total" -ForegroundColor Cyan
        
        if ($calls.Count -gt 0) {
            $latestCall = $calls[0]
            Write-Host "📋 Latest call details:" -ForegroundColor Yellow
            Write-Host "   📞 Call Number: $($latestCall.callNumber)"
            Write-Host "   👤 Caller: $($latestCall.callerFullName)"
            Write-Host "   📧 Email: $($latestCall.callerEmail)"
            Write-Host "   ⚡ Priority: $($latestCall.priority)"
            Write-Host "   📂 Category: $($latestCall.category)"
            Write-Host "   🚻 Client Gender: $($latestCall.clientGender)"
            Write-Host "   📍 District: $($latestCall.district)"
            Write-Host "   📍 Ward: $($latestCall.ward)"
            Write-Host "   ✅ Resolution: $($latestCall.resolution)"
            Write-Host "   ⭐ Satisfaction: $($latestCall.satisfactionRating)"
        }
    }
} catch {
    Write-Host "❌ Error retrieving calls: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Green
