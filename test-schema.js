// Test script to check current Employee schema fields
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkEmployeeSchema() {
  try {
    console.log('Testing Employee schema fields...')
    
    // Try to find any employee
    const employee = await prisma.employee.findFirst()
    
    if (employee) {
      console.log('Available Employee fields:')
      console.log(Object.keys(employee))
    } else {
      console.log('No employees found in database')
    }
    
  } catch (error) {
    console.error('Error checking schema:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkEmployeeSchema()
