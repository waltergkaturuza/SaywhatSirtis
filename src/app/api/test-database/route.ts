import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if meal_indicators table exists and has data
    const indicators = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        name,
        target,
        current,
        unit,
        status,
        last_updated_by,
        last_updated_at,
        notes,
        created_at,
        updated_at
      FROM public.meal_indicators 
      ORDER BY updated_at DESC 
      LIMIT 10
    `
    
    // Test 2: Check table structure
    const columns = await prisma.$queryRaw<any[]>`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'meal_indicators' 
      ORDER BY column_name
    `
    
    // Test 3: Count total indicators
    const count = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total_indicators FROM meal_indicators
    `
    
    return NextResponse.json({
      success: true,
      data: {
        indicators: indicators,
        columns: columns,
        totalCount: count[0]?.total_indicators || 0,
        message: "Database connection successful"
      }
    })
    
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null
    }, { status: 500 })
  }
}
