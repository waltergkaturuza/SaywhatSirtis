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
  "issueDescription": "Testing all new fields"
}
'@

Write-Host "Testing enhanced call centre API..."

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/call-centre/calls' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body
    
    Write-Host "API call successful!"
    Write-Host "Response:"
    $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "Testing retrieval..."
try {
    $getResponse = Invoke-WebRequest -Uri 'http://localhost:3001/api/call-centre/calls' -Method GET
    Write-Host "Retrieval successful!"
    $calls = $getResponse.Content | ConvertFrom-Json
    Write-Host "Found $($calls.Count) calls"
} catch {
    Write-Host "Retrieval Error: $($_.Exception.Message)"
}
