'use client'

import { OpenAI } from 'openai'

// AI Configuration
export interface AIConfig {
  openAI: {
    apiKey: string
    model: 'gpt-4' | 'gpt-3.5-turbo'
    maxTokens: number
  }
  azure?: {
    endpoint: string
    apiKey: string
    model: string
  }
}

// AI Service Types
export interface EmployeeData {
  id: string
  name: string
  department: string
  role: string
  performanceHistory: number[]
  skillsRating: Record<string, number>
  projectsCompleted: number
  attendanceRate: number
  lastReviewScore: number
}

export interface PerformancePrediction {
  employeeId: string
  predictedScore: number
  confidence: number
  factors: {
    factor: string
    impact: number
    recommendation: string
  }[]
  timeframe: '3months' | '6months' | '1year'
}

export interface AttritionAnalysis {
  departmentId: string
  riskLevel: 'low' | 'medium' | 'high'
  attritionProbability: number
  highRiskEmployees: string[]
  recommendations: string[]
}

export interface DocumentAnalysis {
  documentId: string
  category: string
  confidence: number
  extractedData: Record<string, any>
  summary: string
  keyPoints: string[]
  tags: string[]
}

// AI Services Class
export class AIService {
  private openai: OpenAI
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
    this.openai = new OpenAI({
      apiKey: config.openAI.apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use server-side API
    })
  }

  // Predictive Analytics for HR
  async predictEmployeePerformance(employeeData: EmployeeData): Promise<PerformancePrediction> {
    try {
      const prompt = `
        Analyze employee performance data and predict future performance:
        
        Employee: ${employeeData.name}
        Department: ${employeeData.department}
        Role: ${employeeData.role}
        Performance History: ${employeeData.performanceHistory.join(', ')}
        Skills Rating: ${JSON.stringify(employeeData.skillsRating)}
        Projects Completed: ${employeeData.projectsCompleted}
        Attendance Rate: ${employeeData.attendanceRate}%
        Last Review Score: ${employeeData.lastReviewScore}
        
        Provide a performance prediction with score (1-100), confidence level, and key factors.
        Format as JSON with: predictedScore, confidence, factors array with factor, impact, recommendation.
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.config.openAI.maxTokens,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI service')

      const result = JSON.parse(content)
      
      return {
        employeeId: employeeData.id,
        predictedScore: result.predictedScore,
        confidence: result.confidence,
        factors: result.factors,
        timeframe: '6months'
      }
    } catch (error) {
      console.error('Error predicting employee performance:', error)
      throw new Error('Failed to predict employee performance')
    }
  }

  // Document Analysis
  async analyzeDocument(documentContent: string, documentType?: string): Promise<DocumentAnalysis> {
    try {
      const prompt = `
        Analyze the following document and provide categorization and insights:
        
        Document Type: ${documentType || 'Unknown'}
        Content: ${documentContent.substring(0, 2000)}...
        
        Provide analysis as JSON with:
        - category: document category (HR, Finance, Legal, Project, etc.)
        - confidence: confidence level (0-1)
        - extractedData: key data points found
        - summary: brief summary
        - keyPoints: array of important points
        - tags: relevant tags
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.config.openAI.maxTokens,
        temperature: 0.2
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI service')

      const result = JSON.parse(content)
      
      return {
        documentId: `doc_${Date.now()}`,
        category: result.category,
        confidence: result.confidence,
        extractedData: result.extractedData,
        summary: result.summary,
        keyPoints: result.keyPoints,
        tags: result.tags
      }
    } catch (error) {
      console.error('Error analyzing document:', error)
      throw new Error('Failed to analyze document')
    }
  }

  // Enhanced Chatbot with Context
  async getChatbotResponse(
    message: string, 
    context: {
      userId: string
      department: string
      currentPage: string
      recentActions: string[]
    }
  ): Promise<string> {
    try {
      const prompt = `
        You are SIRTIS AI Assistant, an intelligent helper for the SAYWHAT organization.
        
        Context:
        - User Department: ${context.department}
        - Current Page: ${context.currentPage}
        - Recent Actions: ${context.recentActions.join(', ')}
        
        User Message: ${message}
        
        Provide a helpful, context-aware response that:
        1. Addresses the user's question specifically
        2. Considers their department and current context
        3. Suggests relevant actions or next steps
        4. Uses a professional but friendly tone
        
        Keep responses concise and actionable.
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for SIRTIS, specializing in HR, project management, and organizational workflows.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })

      return response.choices[0]?.message?.content || 'I apologize, but I could not process your request at this time.'
    } catch (error) {
      console.error('Error getting chatbot response:', error)
      return 'I apologize, but I am experiencing technical difficulties. Please try again later.'
    }
  }

  // Workflow Automation Analysis
  async analyzeWorkflow(workflowData: {
    processName: string
    steps: string[]
    currentMetrics: Record<string, number>
    bottlenecks: string[]
  }): Promise<{
    optimizations: string[]
    automationOpportunities: string[]
    estimatedImprovement: number
    implementationPriority: 'high' | 'medium' | 'low'
  }> {
    try {
      const prompt = `
        Analyze the following workflow for optimization opportunities:
        
        Process: ${workflowData.processName}
        Current Steps: ${workflowData.steps.join(' → ')}
        Metrics: ${JSON.stringify(workflowData.currentMetrics)}
        Known Bottlenecks: ${workflowData.bottlenecks.join(', ')}
        
        Provide analysis as JSON with:
        - optimizations: array of suggested improvements
        - automationOpportunities: specific automation suggestions
        - estimatedImprovement: percentage improvement (0-100)
        - implementationPriority: priority level
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.4
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI service')

      return JSON.parse(content)
    } catch (error) {
      console.error('Error analyzing workflow:', error)
      throw new Error('Failed to analyze workflow')
    }
  }
}

// AI Service Singleton
let aiServiceInstance: AIService | null = null

export const getAIService = (config?: AIConfig): AIService => {
  if (!aiServiceInstance && config) {
    aiServiceInstance = new AIService(config)
  }
  
  if (!aiServiceInstance) {
    throw new Error('AI Service not initialized. Please provide configuration.')
  }
  
  return aiServiceInstance
}

// Default AI Configuration
export const defaultAIConfig: AIConfig = {
  openAI: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo',
    maxTokens: 500
  }
}
