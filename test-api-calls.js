// Simple API test to verify field mapping
fetch('http://localhost:3000/api/call-centre/calls')
  .then(response => response.json())
  .then(data => {
    console.log('API Response Success:', data.success);
    console.log('Total calls:', data.total);
    if (data.calls && data.calls.length > 0) {
      console.log('\nFirst call record:');
      const firstCall = data.calls[0];
      console.log('ID:', firstCall.id);
      console.log('Officer (mapped):', firstCall.officer);
      console.log('Officer Name (original):', firstCall.officerName);
      console.log('Communication Mode:', firstCall.communicationMode);
      console.log('Validity:', firstCall.validity);
      console.log('Duration:', firstCall.duration);
      console.log('Voucher Issued:', firstCall.voucherIssued);
      console.log('Purpose:', firstCall.purpose);
      
      console.log('\nAll field keys in first record:');
      console.log(Object.keys(firstCall).sort());
    }
  })
  .catch(error => console.error('Error:', error));