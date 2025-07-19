// Phase 4: Redis Caching Service for Performance Optimization
// This service provides centralized caching for SIRTIS applications

import Redis from 'ioredis'

interface CacheConfig {
  host: string
  port: number
  password?: string
  db: number
  keyPrefix: string
  ttl: {
    short: number    // 5 minutes
    medium: number   // 1 hour  
    long: number     // 24 hours
    persistent: number // 7 days
  }
}

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheService {
  private redis: Redis
  private config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = config
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      keyPrefix: config.keyPrefix,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    })

    this.redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    this.redis.on('error', (error: Error) => {
      console.error('❌ Redis connection error:', error)
    })
  }

  // Generic cache operations
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || this.config.ttl.medium
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl
      }
      await this.redis.setex(key, ttl, JSON.stringify(entry))
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key)
      if (!cached) return null

      const entry: CacheEntry<T> = JSON.parse(cached)
      
      // Check if cache entry is still valid
      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        await this.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.redis.exists(key)) === 1
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error)
      return false
    }
  }

  // User session caching
  async setUserSession(sessionId: string, sessionData: any): Promise<void> {
    await this.set(`session:${sessionId}`, sessionData, this.config.ttl.long)
  }

  async getUserSession(sessionId: string): Promise<any> {
    return await this.get(`session:${sessionId}`)
  }

  async deleteUserSession(sessionId: string): Promise<void> {
    await this.delete(`session:${sessionId}`)
  }

  // Employee data caching
  async cacheEmployeeData(employeeId: string, data: any): Promise<void> {
    await this.set(`employee:${employeeId}`, data, this.config.ttl.medium)
  }

  async getEmployeeData(employeeId: string): Promise<any> {
    return await this.get(`employee:${employeeId}`)
  }

  // Project data caching
  async cacheProjectData(projectId: string, data: any): Promise<void> {
    await this.set(`project:${projectId}`, data, this.config.ttl.medium)
  }

  async getProjectData(projectId: string): Promise<any> {
    return await this.get(`project:${projectId}`)
  }

  // Dashboard analytics caching
  async cacheDashboardMetrics(userId: string, metrics: any): Promise<void> {
    await this.set(`dashboard:${userId}`, metrics, this.config.ttl.short)
  }

  async getDashboardMetrics(userId: string): Promise<any> {
    return await this.get(`dashboard:${userId}`)
  }

  // Call center metrics caching
  async cacheCallCenterMetrics(agentId: string, metrics: any): Promise<void> {
    await this.set(`callcenter:${agentId}`, metrics, this.config.ttl.short)
  }

  async getCallCenterMetrics(agentId: string): Promise<any> {
    return await this.get(`callcenter:${agentId}`)
  }

  // Inventory data caching
  async cacheInventoryData(category: string, data: any): Promise<void> {
    await this.set(`inventory:${category}`, data, this.config.ttl.medium)
  }

  async getInventoryData(category: string): Promise<any> {
    return await this.get(`inventory:${category}`)
  }

  // API response caching for external services
  async cacheAPIResponse(endpoint: string, response: any, ttl?: number): Promise<void> {
    const cacheKey = `api:${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`
    await this.set(cacheKey, response, ttl || this.config.ttl.short)
  }

  async getAPIResponse(endpoint: string): Promise<any> {
    const cacheKey = `api:${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`
    return await this.get(cacheKey)
  }

  // Bulk operations
  async setMultiple(entries: Array<{key: string, value: any, ttl?: number}>): Promise<void> {
    const pipeline = this.redis.pipeline()
    
    entries.forEach(entry => {
      const ttl = entry.ttl || this.config.ttl.medium
      const cacheEntry: CacheEntry = {
        data: entry.value,
        timestamp: Date.now(),
        ttl: ttl
      }
      pipeline.setex(entry.key, ttl, JSON.stringify(cacheEntry))
    })

    await pipeline.exec()
  }

  async getMultiple(keys: string[]): Promise<Record<string, any>> {
    try {
      const pipeline = this.redis.pipeline()
      keys.forEach(key => pipeline.get(key))
      
      const results = await pipeline.exec()
      const data: Record<string, any> = {}

      results?.forEach((result: any, index: number) => {
        if (result && result[1]) {
          try {
            const entry: CacheEntry = JSON.parse(result[1] as string)
            if (Date.now() - entry.timestamp <= entry.ttl * 1000) {
              data[keys[index]] = entry.data
            }
          } catch (error) {
            console.error(`Parse error for key ${keys[index]}:`, error)
          }
        }
      })

      return data
    } catch (error) {
      console.error('Bulk get error:', error)
      return {}
    }
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error(`Pattern invalidation error for ${pattern}:`, error)
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`*:${userId}`)
  }

  async invalidateDepartmentCache(department: string): Promise<void> {
    await this.invalidatePattern(`*:${department}:*`)
  }

  // Performance monitoring
  async getCacheStats(): Promise<{
    hits: number
    misses: number
    memory: string
    keys: number
  }> {
    try {
      const info = await this.redis.info('stats')
      const memory = await this.redis.info('memory')
      const dbsize = await this.redis.dbsize()

      // Parse Redis info output
      const statsLines = info.split('\r\n')
      const memoryLines = memory.split('\r\n')

      const hits = this.parseInfoValue(statsLines, 'keyspace_hits') || 0
      const misses = this.parseInfoValue(statsLines, 'keyspace_misses') || 0
      const usedMemory = this.parseInfoValue(memoryLines, 'used_memory_human') || '0B'

      return {
        hits: hits,
        misses: misses,
        memory: usedMemory,
        keys: dbsize
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return { hits: 0, misses: 0, memory: '0B', keys: 0 }
    }
  }

  private parseInfoValue(lines: string[], key: string): any {
    const line = lines.find(l => l.startsWith(key + ':'))
    return line ? line.split(':')[1] : null
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Redis ping error:', error)
      return false
    }
  }

  // Cleanup and disconnect
  async disconnect(): Promise<void> {
    await this.redis.disconnect()
  }
}

// Default configuration
export const createCacheService = (customConfig?: Partial<CacheConfig>): CacheService => {
  const defaultConfig: CacheConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'sirtis:',
    ttl: {
      short: 300,     // 5 minutes
      medium: 3600,   // 1 hour
      long: 86400,    // 24 hours
      persistent: 604800 // 7 days
    }
  }

  const config = { ...defaultConfig, ...customConfig }
  return new CacheService(config)
}

// Export default instance
export const cacheService = createCacheService()
