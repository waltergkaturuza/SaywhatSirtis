import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock system configuration data - in production, this would come from your database
let systemConfigs = [
  {
    id: "1",
    key: "max_file_size",
    value: "50",
    description: "Maximum file upload size in MB",
    category: "File Management",
    type: "number",
    validationRules: { min: 1, max: 1000 },
    lastModified: "2025-07-17 08:20:00",
    modifiedBy: "admin"
  },
  {
    id: "2",
    key: "session_timeout",
    value: "3600",
    description: "User session timeout in seconds",
    category: "Security",
    type: "number",
    validationRules: { min: 300, max: 86400 },
    lastModified: "2025-07-16 14:30:00",
    modifiedBy: "admin"
  },
  {
    id: "3",
    key: "email_notifications",
    value: "true",
    description: "Enable email notifications",
    category: "Notifications",
    type: "boolean",
    validationRules: {},
    lastModified: "2025-07-15 10:45:00",
    modifiedBy: "admin"
  },
  {
    id: "4",
    key: "api_rate_limit",
    value: "1000",
    description: "API requests per hour per user",
    category: "Security",
    type: "number",
    validationRules: { min: 100, max: 10000 },
    lastModified: "2025-07-14 16:20:00",
    modifiedBy: "admin"
  },
  {
    id: "5",
    key: "backup_retention_days",
    value: "30",
    description: "Number of days to retain backups",
    category: "Backup",
    type: "number",
    validationRules: { min: 7, max: 365 },
    lastModified: "2025-07-13 09:15:00",
    modifiedBy: "admin"
  },
  {
    id: "6",
    key: "default_theme",
    value: "light",
    description: "Default application theme",
    category: "UI/UX",
    type: "string",
    validationRules: { enum: ["light", "dark", "auto"] },
    lastModified: "2025-07-12 11:30:00",
    modifiedBy: "admin"
  },
  {
    id: "7",
    key: "maintenance_mode",
    value: "false",
    description: "Enable maintenance mode",
    category: "System",
    type: "boolean",
    validationRules: {},
    lastModified: "2025-07-11 08:00:00",
    modifiedBy: "admin"
  },
  {
    id: "8",
    key: "log_level",
    value: "info",
    description: "System logging level",
    category: "System",
    type: "string",
    validationRules: { enum: ["error", "warn", "info", "debug"] },
    lastModified: "2025-07-10 15:45:00",
    modifiedBy: "admin"
  },
  {
    id: "9",
    key: "database_connection_pool",
    value: "20",
    description: "Maximum database connections",
    category: "Database",
    type: "number",
    validationRules: { min: 5, max: 100 },
    lastModified: "2025-07-09 12:20:00",
    modifiedBy: "admin"
  },
  {
    id: "10",
    key: "audit_log_retention",
    value: "90",
    description: "Audit log retention period in days",
    category: "Security",
    type: "number",
    validationRules: { min: 30, max: 365 },
    lastModified: "2025-07-08 14:10:00",
    modifiedBy: "admin"
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const url = new URL(request.url)
    const category = url.searchParams.get("category")
    const search = url.searchParams.get("search")

    let filteredConfigs = [...systemConfigs]

    // Apply filters
    if (category) {
      filteredConfigs = filteredConfigs.filter(config =>
        config.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (search) {
      filteredConfigs = filteredConfigs.filter(config =>
        config.key.toLowerCase().includes(search.toLowerCase()) ||
        config.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Get unique categories for filter dropdown
    const categories = [...new Set(systemConfigs.map(config => config.category))]

    return NextResponse.json({
      configs: filteredConfigs,
      categories,
      total: filteredConfigs.length
    })
  } catch (error) {
    console.error("Error fetching system configurations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
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
      case "create_config":
        // Validate required fields
        if (!configData.key || !configData.value || !configData.description || !configData.category || !configData.type) {
          return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
          )
        }

        // Check if key already exists
        if (systemConfigs.some(config => config.key === configData.key)) {
          return NextResponse.json(
            { error: "Configuration key already exists" },
            { status: 400 }
          )
        }

        const newConfig = {
          id: (systemConfigs.length + 1).toString(),
          ...configData,
          lastModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
          modifiedBy: session.user?.email || "unknown",
          validationRules: configData.validationRules || {}
        }

        systemConfigs.push(newConfig)

        return NextResponse.json({
          success: true,
          message: "Configuration created successfully",
          config: newConfig
        })

      case "update_config":
        const configIndex = systemConfigs.findIndex(config => config.id === configId)
        if (configIndex === -1) {
          return NextResponse.json({ error: "Configuration not found" }, { status: 404 })
        }

        const existingConfig = systemConfigs[configIndex]

        // Validate value based on type and rules
        const validationResult = validateConfigValue(configData.value, existingConfig.type, existingConfig.validationRules)
        if (!validationResult.isValid) {
          return NextResponse.json(
            { error: validationResult.error },
            { status: 400 }
          )
        }

        // Update configuration
        systemConfigs[configIndex] = {
          ...existingConfig,
          value: configData.value,
          lastModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
          modifiedBy: session.user?.email || "unknown"
        }

        return NextResponse.json({
          success: true,
          message: "Configuration updated successfully",
          config: systemConfigs[configIndex]
        })

      case "delete_config":
        const configToDelete = systemConfigs.find(config => config.id === configId)
        if (!configToDelete) {
          return NextResponse.json({ error: "Configuration not found" }, { status: 404 })
        }

        systemConfigs = systemConfigs.filter(config => config.id !== configId)

        return NextResponse.json({
          success: true,
          message: "Configuration deleted successfully"
        })

      case "reset_to_default":
        // Reset specific configuration to default value
        const defaultValues: Record<string, string> = {
          "max_file_size": "25",
          "session_timeout": "3600",
          "email_notifications": "true",
          "api_rate_limit": "500",
          "backup_retention_days": "30",
          "default_theme": "light",
          "maintenance_mode": "false",
          "log_level": "info",
          "database_connection_pool": "10",
          "audit_log_retention": "90"
        }

        const configToReset = systemConfigs.find(config => config.id === configId)
        if (!configToReset) {
          return NextResponse.json({ error: "Configuration not found" }, { status: 404 })
        }

        const defaultValue = defaultValues[configToReset.key]
        if (!defaultValue) {
          return NextResponse.json({ error: "No default value available" }, { status: 400 })
        }

        const resetConfigIndex = systemConfigs.findIndex(config => config.id === configId)
        systemConfigs[resetConfigIndex] = {
          ...systemConfigs[resetConfigIndex],
          value: defaultValue,
          lastModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
          modifiedBy: session.user?.email || "unknown"
        }

        return NextResponse.json({
          success: true,
          message: "Configuration reset to default value",
          config: systemConfigs[resetConfigIndex]
        })

      case "bulk_update":
        const { configs } = configData
        const updatedConfigs = []

        for (const updateConfig of configs) {
          const index = systemConfigs.findIndex(config => config.id === updateConfig.id)
          if (index !== -1) {
            const validationResult = validateConfigValue(
              updateConfig.value,
              systemConfigs[index].type,
              systemConfigs[index].validationRules
            )

            if (validationResult.isValid) {
              systemConfigs[index] = {
                ...systemConfigs[index],
                value: updateConfig.value,
                lastModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
                modifiedBy: session.user?.email || "unknown"
              }
              updatedConfigs.push(systemConfigs[index])
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: `Updated ${updatedConfigs.length} configurations`,
          updatedConfigs
        })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error processing system configuration action:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function validateConfigValue(value: string, type: string, rules: any): { isValid: boolean; error?: string } {
  switch (type) {
    case "number":
      const numValue = parseFloat(value)
      if (isNaN(numValue)) {
        return { isValid: false, error: "Value must be a valid number" }
      }
      if (rules.min !== undefined && numValue < rules.min) {
        return { isValid: false, error: `Value must be at least ${rules.min}` }
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return { isValid: false, error: `Value must be at most ${rules.max}` }
      }
      break

    case "boolean":
      if (!["true", "false"].includes(value.toLowerCase())) {
        return { isValid: false, error: "Value must be true or false" }
      }
      break

    case "string":
      if (rules.enum && !rules.enum.includes(value)) {
        return { isValid: false, error: `Value must be one of: ${rules.enum.join(", ")}` }
      }
      if (rules.minLength && value.length < rules.minLength) {
        return { isValid: false, error: `Value must be at least ${rules.minLength} characters` }
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return { isValid: false, error: `Value must be at most ${rules.maxLength} characters` }
      }
      break

    default:
      break
  }

  return { isValid: true }
}
