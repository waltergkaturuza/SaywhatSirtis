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

// Document Repository AI Types
export interface DocumentAnalysis {
  documentId: string
  sentiment: {
    score: number // -1 to 1
    label: 'positive' | 'neutral' | 'negative'
    confidence: number
  }
  readability: {
    score: number // 0 to 100
    level: 'elementary' | 'middle' | 'high' | 'college' | 'graduate'
    suggestions: string[]
  }
  quality: {
    score: number // 0 to 100
    issues: string[]
    strengths: string[]
  }
  keyPhrases: string[]
  summary: string
  topics: string[]
  language: string
  wordCount: number
  estimatedReadingTime: number // minutes
}

export interface DocumentSearchResult {
  documentId: string
  relevanceScore: number
  matchReasons: string[]
  snippet: string
  highlightedText?: string
}

export interface DocumentSuggestion {
  type: 'similar' | 'related' | 'template' | 'reference'
  documentId: string
  title: string
  relevanceScore: number
  reason: string
}

export interface DocumentClassification {
  suggestedCategory: string
  confidence: number
  suggestedTags: string[]
  securityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'TOP_SECRET'
  department: string
  documentType: 'policy' | 'procedure' | 'report' | 'contract' | 'memo' | 'presentation' | 'other'
}

export interface ContentGeneration {
  type: 'summary' | 'outline' | 'template' | 'translation' | 'rewrite'
  content: string
  metadata: {
    originalLength?: number
    newLength?: number
    language?: string
    tone?: string
  }
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

  // === DOCUMENT REPOSITORY AI FEATURES ===

  // Comprehensive Document Analysis
  async analyzeDocument(documentContent: string, metadata: {
    filename: string
    mimeType: string
    size: number
  }): Promise<DocumentAnalysis> {
    try {
      const prompt = `
        Analyze the following document comprehensively:
        
        Filename: ${metadata.filename}
        Content: ${documentContent.substring(0, 4000)}...
        
        Provide detailed analysis as JSON with:
        {
          "sentiment": {
            "score": number (-1 to 1),
            "label": "positive" | "neutral" | "negative",
            "confidence": number (0 to 1)
          },
          "readability": {
            "score": number (0 to 100),
            "level": "elementary" | "middle" | "high" | "college" | "graduate",
            "suggestions": ["improvement suggestion 1", "suggestion 2"]
          },
          "quality": {
            "score": number (0 to 100),
            "issues": ["issue 1", "issue 2"],
            "strengths": ["strength 1", "strength 2"]
          },
          "keyPhrases": ["phrase 1", "phrase 2", "phrase 3"],
          "summary": "brief summary",
          "topics": ["topic 1", "topic 2"],
          "language": "detected language",
          "wordCount": estimated_word_count,
          "estimatedReadingTime": reading_time_in_minutes
        }
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI service')

      const analysis = JSON.parse(content)
      return {
        documentId: '', // Will be set by caller
        ...analysis
      }
    } catch (error) {
      console.error('Error analyzing document:', error)
      throw new Error('Failed to analyze document')
    }
  }

  // AI-Powered Document Search
  async intelligentSearch(query: string, documents: {
    id: string
    title: string
    content: string
    metadata: Record<string, any>
  }[]): Promise<DocumentSearchResult[]> {
    try {
      const prompt = `
        Given the search query: "${query}"
        
        Find the most relevant documents and explain the relevance:
        
        Documents:
        ${documents.map(doc => `ID: ${doc.id}\nTitle: ${doc.title}\nContent: ${doc.content.substring(0, 500)}...\n---`).join('\n')}
        
        Return JSON array of relevant documents with:
        {
          "documentId": "document_id",
          "relevanceScore": number (0 to 1),
          "matchReasons": ["reason 1", "reason 2"],
          "snippet": "relevant excerpt from document"
        }
        
        Only include documents with relevance score > 0.3
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.2
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI service')

      return JSON.parse(content)
    } catch (error) {
      console.error('Error in intelligent search:', error)
      return []
    }
  }

  // Document Classification
  async classifyDocument(content: string, filename: string): Promise<DocumentClassification> {
    try {
      const prompt = `
        Classify this document based on its content and filename:
        
        Filename: ${filename}
        Content: ${content.substring(0, 2000)}...
        
        Return JSON with:
        {
          "suggestedCategory": "category name",
          "confidence": number (0 to 1),
          "suggestedTags": ["tag1", "tag2", "tag3"],
          "securityLevel": "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | "TOP_SECRET",
          "department": "likely department",
          "documentType": "policy" | "procedure" | "report" | "contract" | "memo" | "presentation" | "other"
        }
        
        Base security level on content sensitivity and typical organizational practices.
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3
      })

      const content_response = response.choices[0]?.message?.content
      if (!content_response) throw new Error('No response from AI service')

      return JSON.parse(content_response)
    } catch (error) {
      console.error('Error classifying document:', error)
      throw new Error('Failed to classify document')
    }
  }

  // Content Generation
  async generateContent(request: {
    type: 'summary' | 'outline' | 'template' | 'translation' | 'rewrite'
    input: string
    parameters?: {
      targetLanguage?: string
      tone?: 'formal' | 'casual' | 'professional'
      length?: 'short' | 'medium' | 'long'
      format?: string
    }
  }): Promise<ContentGeneration> {
    try {
      let prompt = ''
      
      switch (request.type) {
        case 'summary':
          prompt = `Create a ${request.parameters?.length || 'medium'} summary of the following content:\n\n${request.input}`
          break
        case 'outline':
          prompt = `Create a structured outline for the following content:\n\n${request.input}`
          break
        case 'template':
          prompt = `Create a reusable template based on this document structure:\n\n${request.input}`
          break
        case 'translation':
          prompt = `Translate the following content to ${request.parameters?.targetLanguage || 'English'}:\n\n${request.input}`
          break
        case 'rewrite':
          prompt = `Rewrite the following content in a ${request.parameters?.tone || 'professional'} tone:\n\n${request.input}`
          break
      }

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.4
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI service')

      return {
        type: request.type,
        content,
        metadata: {
          originalLength: request.input.length,
          newLength: content.length,
          language: request.parameters?.targetLanguage,
          tone: request.parameters?.tone
        }
      }
    } catch (error) {
      console.error('Error generating content:', error)
      throw new Error('Failed to generate content')
    }
  }

  // Document Suggestions
  async suggestRelatedDocuments(currentDoc: {
    title: string
    content: string
    tags: string[]
  }, availableDocs: {
    id: string
    title: string
    content: string
    tags: string[]
  }[]): Promise<DocumentSuggestion[]> {
    try {
      const prompt = `
        Given this current document:
        Title: ${currentDoc.title}
        Content: ${currentDoc.content.substring(0, 1000)}...
        Tags: ${currentDoc.tags.join(', ')}
        
        Find related documents from this list:
        ${availableDocs.map(doc => `ID: ${doc.id}\nTitle: ${doc.title}\nTags: ${doc.tags.join(', ')}\n---`).join('\n')}
        
        Return JSON array with:
        {
          "type": "similar" | "related" | "template" | "reference",
          "documentId": "document_id",
          "title": "document_title",
          "relevanceScore": number (0 to 1),
          "reason": "explanation of relationship"
        }
        
        Only include documents with relevance > 0.4
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI service')

      return JSON.parse(content)
    } catch (error) {
      console.error('Error suggesting related documents:', error)
      return []
    }
  }

  // OCR Text Enhancement
  async enhanceOCRText(rawOCRText: string): Promise<string> {
    try {
      const prompt = `
        The following text was extracted using OCR and may contain errors. 
        Please correct spelling mistakes, fix spacing, and improve readability while preserving the original meaning:
        
        ${rawOCRText}
        
        Return only the corrected text.
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.2
      })

      return response.choices[0]?.message?.content || rawOCRText
    } catch (error) {
      console.error('Error enhancing OCR text:', error)
      return rawOCRText
    }
  }

  // Document Compliance Check
  async checkCompliance(content: string, regulations: string[]): Promise<{
    compliant: boolean
    issues: string[]
    suggestions: string[]
    confidence: number
  }> {
    try {
      const prompt = `
        Check if this document complies with the following regulations: ${regulations.join(', ')}
        
        Document content: ${content.substring(0, 2000)}...
        
        Return JSON with:
        {
          "compliant": boolean,
          "issues": ["issue 1", "issue 2"],
          "suggestions": ["suggestion 1", "suggestion 2"],
          "confidence": number (0 to 1)
        }
      `

      const response = await this.openai.chat.completions.create({
        model: this.config.openAI.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      })

      const content_response = response.choices[0]?.message?.content
      if (!content_response) throw new Error('No response from AI service')

      return JSON.parse(content_response)
    } catch (error) {
      console.error('Error checking compliance:', error)
      throw new Error('Failed to check compliance')
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
    apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo',
    maxTokens: 500
  }
}

// Default AI Service Instance
export const aiService = getAIService(defaultAIConfig)
