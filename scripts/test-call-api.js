#!/usr/bin/env node

/**
 * Test Call Centre API Field Mappings
 * Verifies that officer, communication mode, duration, and other fields are properly mapped
 */

async function testCallAPI() {
  try {
    console.log('🔍 Testing Call Centre API Field Mappings')
    console.log('=========================================')
    
    const response = await fetch('http://localhost:3000/api/call-centre/calls', {
      headers: {
        'Cookie': 'next-auth.session-token=test'
      }
    })
    
    if (!response.ok) {
      console.log(`❌ API request failed: ${response.status} ${response.statusText}`)
      return
    }
    
    const data = await response.json()
    
    if (!data.success || !data.calls || data.calls.length === 0) {
      console.log('❌ No call data returned from API')
      return
    }
    
    console.log(`✅ API returned ${data.calls.length} call records`)
    console.log('')
    
    // Test first call record
    const call = data.calls[0]
    console.log('📋 Testing Field Mappings for First Call:')
    console.log('==========================================')
    
    const fields = [
      { name: 'ID', value: call.id },
      { name: 'Officer', value: call.officer },
      { name: 'Officer Name (Raw)', value: call.officerName },
      { name: 'Communication Mode', value: call.communicationMode },
      { name: 'Mode of Communication (Raw)', value: call.modeOfCommunication },
      { name: 'Duration', value: call.duration },
      { name: 'Validity', value: call.validity },
      { name: 'Call Validity (Raw)', value: call.callValidity },
      { name: 'Date Time', value: call.dateTime },
      { name: 'Created At (Raw)', value: call.createdAt },
      { name: 'Purpose', value: call.purpose },
      { name: 'Caller Name', value: call.callerName },
      { name: 'Voucher Issued', value: call.voucherIssued }
    ]
    
    let allFieldsOK = true
    
    fields.forEach(field => {
      const status = field.value && field.value !== 'N/A' && field.value !== null ? '✅' : '❌'
      if (status === '❌') allFieldsOK = false
      
      console.log(`${status} ${field.name}: ${field.value || 'NULL/EMPTY'}`)
    })
    
    console.log('')
    console.log('📊 Summary:')
    console.log(`Overall Status: ${allFieldsOK ? '✅ All fields properly mapped' : '❌ Some fields missing or null'}`)
    
    if (!allFieldsOK) {
      console.log('')
      console.log('🔧 Issues Found:')
      fields.forEach(field => {
        if (!field.value || field.value === 'N/A' || field.value === null) {
          console.log(`- ${field.name} is missing or null`)
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message)
  }
}

testCallAPI()