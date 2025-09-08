import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to run migrations
    if (!session?.user?.roles?.includes('admin')) {
      return NextResponse.json({ 
        error: 'Unauthorized. Admin access required for database migrations.' 
      }, { status: 401 })
    }

    // Import and run the migration
    const { runProductionMigration } = require('../../../../scripts/production-migration')
    
    console.log('🚀 Admin initiated production migration:', session.user.email)
    
    // Run migration (this should be done carefully in production)
    const result = await runProductionMigration()
    
    return NextResponse.json({
      success: true,
      message: 'Production migration completed successfully',
      timestamp: new Date().toISOString(),
      initiatedBy: session.user.email
    })
    
  } catch (error) {
    console.error('❌ Production migration failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.roles?.includes('admin')) {
      return NextResponse.json({ 
        error: 'Unauthorized. Admin access required.' 
      }, { status: 401 })
    }

    // Check migration status
    const { checkAndMigrateProduction } = require('../../../../scripts/production-migration')
    
    // Just check, don't migrate
    const status = await checkAndMigrateProduction()
    
    return NextResponse.json({
      migrationRequired: !status,
      message: status ? 'Database schema is up to date' : 'Migration required',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Migration status check failed:', error)
    
    return NextResponse.json({
      error: 'Failed to check migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
