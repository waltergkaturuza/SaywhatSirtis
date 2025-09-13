import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Temporarily allow unauthenticated access in development for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges (allow in development)
    if (session) {
      const hasAdminAccess = session.user?.email?.includes("admin") || 
                            session.user?.email?.includes("john.doe")
      
      if (!hasAdminAccess && !isDevelopment) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    // Fetch system configurations from database
    const systemConfigs = await prisma.system_config.findMany({
      orderBy: {
        category: 'asc'
      }
    })

    // Transform data to match frontend interface
    const transformedConfigs = systemConfigs.map(config => ({
      id: config.id,
      key: config.key,
      value: typeof config.value === 'string' ? config.value : JSON.stringify(config.value),
      description: config.description,
      category: config.category,
      type: determineType(config.value),
      lastModified: config.updatedAt.toISOString(),
      modifiedBy: "admin" // TODO: Add user tracking to SystemConfig model
    }))

    return NextResponse.json({
      success: true,
      configs: transformedConfigs,
      total: systemConfigs.length
    })
  } catch (error) {
    console.error("Error fetching system configs:", error)
    
    // Fallback to mock system configurations when database is unavailable
    console.log("Database unavailable, returning mock config data for development")
    const mockConfigs = [
      {
        id: "1",
        key: "SYSTEM_NAME",
        value: "SIRTIS Management System",
        description: "The name displayed in the application header",
        category: "General",
        type: "string" as const,
        lastModified: new Date().toISOString(),
        modifiedBy: "System"
      },
      {
        id: "2",
        key: "MAX_FILE_SIZE",
        value: "10485760",
        description: "Maximum file upload size in bytes (10MB)",
        category: "Upload",
        type: "number" as const,
        lastModified: new Date().toISOString(),
        modifiedBy: "System"
      },
      {
        id: "3",
        key: "ENABLE_NOTIFICATIONS",
        value: "true",
        description: "Enable system-wide notifications",
        category: "Notifications",
        type: "boolean" as const,
        lastModified: new Date().toISOString(),
        modifiedBy: "System"
      }
    ]

    return NextResponse.json({
      success: true,
      configs: mockConfigs,
      total: mockConfigs.length,
      note: "Using mock data - database unavailable"
    })
  }
}

function determineType(value: any): 'string' | 'number' | 'boolean' | 'json' {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') {
    // Try to parse as number
    if (!isNaN(Number(value))) return 'number'
    // Try to parse as boolean
    if (value === 'true' || value === 'false') return 'boolean'
    return 'string'
  }
  return 'json'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { action, configId, configData } = await request.json()

    switch (action) {
      case 'update_config':
        try {
          let value = configData.value
          
          // Convert value to appropriate type
          if (value === 'true') value = true
          else if (value === 'false') value = false
          else if (!isNaN(Number(value))) value = Number(value)

          const updatedConfig = await prisma.system_config.update({
            where: { id: configId },
            data: { value }
          })

          const transformedConfig = {
            id: updatedConfig.id,
            key: updatedConfig.key,
            value: typeof updatedConfig.value === 'string' ? updatedConfig.value : JSON.stringify(updatedConfig.value),
            description: updatedConfig.description,
            category: updatedConfig.category,
            type: determineType(updatedConfig.value),
            lastModified: updatedConfig.updatedAt.toISOString(),
            modifiedBy: "admin"
          }

          return NextResponse.json({
            success: true,
            config: transformedConfig,
            message: "Configuration updated successfully"
          })
        } catch (error) {
          console.error("Error updating config:", error)
          return NextResponse.json(
            { error: "Failed to update configuration" },
            { status: 500 }
          )
        }

      case 'create_config':
        try {
          let value = configData.value
          
          // Convert value to appropriate type
          if (value === 'true') value = true
          else if (value === 'false') value = false
          else if (!isNaN(Number(value))) value = Number(value)

          const newConfig = await prisma.system_config.create({
            data: {
              id: randomUUID(),
              key: configData.key,
              value,
              description: configData.description,
              category: configData.category,
              updatedAt: new Date(),
            }
          })

          const transformedConfig = {
            id: newConfig.id,
            key: newConfig.key,
            value: typeof newConfig.value === 'string' ? newConfig.value : JSON.stringify(newConfig.value),
            description: newConfig.description,
            category: newConfig.category,
            type: determineType(newConfig.value),
            lastModified: newConfig.updatedAt.toISOString(),
            modifiedBy: "admin"
          }

          return NextResponse.json({
            success: true,
            config: transformedConfig,
            message: "Configuration created successfully"
          })
        } catch (error) {
          console.error("Error creating config:", error)
          return NextResponse.json(
            { error: "Failed to create configuration" },
            { status: 500 }
          )
        }

      case 'delete_config':
        try {
          await prisma.system_config.delete({
            where: { id: configId }
          })

          return NextResponse.json({
            success: true,
            message: "Configuration deleted successfully"
          })
        } catch (error) {
          console.error("Error deleting config:", error)
          return NextResponse.json(
            { error: "Failed to delete configuration" },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in config API:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
