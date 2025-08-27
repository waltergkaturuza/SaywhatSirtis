import { createClient } from '@supabase/supabase-js'

// Test Supabase connection with your credentials
const supabaseUrl = 'https://yuwwqupyqpmkbqzvqiee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3dxdXB5cXBta2JxenZxaWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDU3ODEsImV4cCI6MjA2ODU4MTc4MX0.qxfSGzCFDy3vurFrc6LarSLvEEZsvNamlV6C-sHQXN8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔌 Testing Supabase connection...')
  
  try {
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    
    // Test 2: Check existing tables
    const { data: tables } = await supabase
      .rpc('get_table_names')
      .catch(() => null)
    
    console.log('📊 Checking table structure...')
    
    // Test 3: Check if activities table exists
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('count(*)')
      .limit(1)
    
    if (activitiesError) {
      console.log('⚠️  Activities table missing - migration needed')
      console.log('Error:', activitiesError.message)
    } else {
      console.log('✅ Activities table exists!')
    }
    
    // Test 4: Check projects table structure
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, status, priority')
      .limit(1)
    
    if (projectsError) {
      console.log('⚠️  Projects table structure issue:', projectsError.message)
    } else {
      console.log('✅ Projects table structure looks good!')
    }
    
    return true
    
  } catch (err) {
    console.error('❌ Test failed:', err)
    return false
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Database connection test completed!')
    console.log('Next step: Run the migration script in Supabase SQL Editor')
  } else {
    console.log('\n💡 Database needs migration - use the SQL script provided')
  }
})

export { testConnection }
