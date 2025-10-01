// Test the authentication logic with the new user credentials
const bcrypt = require('bcryptjs');

async function testPasswordVerification() {
  // Simulate what happens when creating a user with password "tate@123"
  const inputPassword = "tate@123";
  const hashedPassword = await bcrypt.hash(inputPassword, 10);
  
  console.log('=== PASSWORD VERIFICATION TEST ===');
  console.log('Input password:', inputPassword);
  console.log('Generated hash:', hashedPassword);
  console.log('Hash length:', hashedPassword.length);
  
  // Test verification
  const isValid1 = await bcrypt.compare(inputPassword, hashedPassword);
  const isValid2 = await bcrypt.compare("wrong", hashedPassword);
  
  console.log('Verification with correct password:', isValid1);
  console.log('Verification with wrong password:', isValid2);
  
  // Test some variations that might have been entered
  const variations = [
    "tate@123",
    "Tate@123", 
    "TATE@123",
    "tate@123 ",
    " tate@123"
  ];
  
  console.log('\n=== TESTING PASSWORD VARIATIONS ===');
  for (const variant of variations) {
    const result = await bcrypt.compare(variant, hashedPassword);
    console.log(`"${variant}" -> ${result}`);
  }
}

testPasswordVerification();