import { NextResponse } from "next/server"
import { testDatabaseConnection, testBasicQueries } from "@/lib/test-db"

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test 1: Basic connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionTest.message,
        test: "connection"
      }, { status: 500 })
    }

    // Test 2: Basic queries
    const queryTest = await testBasicQueries()
    if (!queryTest.success) {
      return NextResponse.json({
        success: false,
        error: "Database queries failed", 
        details: queryTest.message,
        test: "queries"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database is working correctly",
      connectionTest: connectionTest.message,
      queryTest: queryTest.message,
      data: queryTest.data
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: "Database test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
