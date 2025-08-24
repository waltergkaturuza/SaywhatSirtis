import { prisma } from '@/lib/prisma'

export async function testDatabaseConnection() {
  try {
    // Simple test query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection successful:', result)
    return { success: true, message: 'Database connected successfully' }
  } catch (error) {
    console.error('Database connection error:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown database error',
      error 
    }
  }
}

export async function testBasicQueries() {
  try {
    // Test basic model access
    const userCount = await prisma.user.count()
    const projectCount = await prisma.project.count()
    
    console.log('Database queries successful:', { userCount, projectCount })
    return { 
      success: true, 
      data: { userCount, projectCount },
      message: 'Basic queries executed successfully' 
    }
  } catch (error) {
    console.error('Database query error:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown query error',
      error 
    }
  }
}
