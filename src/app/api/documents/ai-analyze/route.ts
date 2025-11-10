import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

const AI_COOLDOWN_MS = 15 * 60 * 1000 // 15 minutes
let openAICooldownUntil = 0
let geminiCooldownUntil = 0
let openAIQuotaExceeded = false
let geminiQuotaExceeded = false

const now = () => Date.now()

const isRateLimitOrQuotaError = (error: any) => {
  if (!error) return false
  if (error.status === 429 || error?.response?.status === 429) return true
  if (typeof error.code === 'string' && error.code.toLowerCase().includes('quota')) return true
  if (typeof error.message === 'string' && error.message.toLowerCase().includes('quota')) return true
  if (Array.isArray(error?.errorDetails)) {
    return error.errorDetails.some((detail: any) => 
      detail?.reason === 'RATE_LIMIT_EXCEEDED' || detail?.metadata?.quota_limit
    )
  }
  if (error?.error?.type === 'insufficient_quota') return true
  return false
}

// Document analysis utilities
const analyzeFileType = (file: File) => {
  const { type, name } = file
  
  if (type.includes('pdf')) return { type: 'PDF Document', category: 'Document' }
  if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) 
    return { type: 'Word Document', category: 'Document' }
  if (type.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls')) 
    return { type: 'Excel Spreadsheet', category: 'Spreadsheet' }
  if (type.includes('powerpoint') || name.endsWith('.pptx') || name.endsWith('.ppt')) 
    return { type: 'PowerPoint Presentation', category: 'Presentation' }
  if (type.includes('image')) return { type: 'Image File', category: 'Media' }
  if (type.includes('text')) return { type: 'Text Document', category: 'Document' }
  
  return { type: 'Unknown Document', category: 'Other' }
}

// Valid document categories that AI can suggest
const validDocumentCategories = [
  "Activity Reports",
  "Annual Reports", 
  "Asset Management Records",
  "Award Documents",
  "Baseline and Endline Reports",
  "Beneficiary Data & Records",
  "Board Meeting Minutes",
  "Budgets & Forecasts",
  "Capacity Building Materials",
  "Case Management Reports",
  "Communication & PR Materials",
  "Community Engagement Records",
  "Compliance & Audit Reports",
  "Conflict of Interest Declarations",
  "Contracts & Agreements",
  "Data Protection & Privacy Records",
  "Departmental Monthly Reports",
  "Disciplinary Reports",
  "Donor Reports",
  "Emergency Response Plans",
  "Employee Contracts",
  "Environmental Impact Assessments",
  "Event Documentation",
  "Exit Strategies & Closure Reports",
  "External Evaluation Reports",
  "Financial Documents",
  "Flagship Events Reports",
  "Fundraising Materials",
  "Government Relations Documents",
  "Grant Agreements",
  "Grant Proposals",
  "Health & Safety Records",
  "Impact Assessment Reports",
  "Incident Reports",
  "Insurance Documents",
  "Internal Audit Reports",
  "IT & Systems Documentation",
  "Job Descriptions & Specifications",
  "Knowledge Management Resources",
  "Legal Documents",
  "Lesson Learned Documents",
  "Management Accounts Reports",
  "Marketing Materials",
  "Media Coverage & Press Releases",
  "Meeting Notes & Action Items",
  "Memorandums of Understanding (MOUs)",
  "Monitoring & Evaluation Reports",
  "Observer Newsletters",
  "Organizational Charts",
  "Partnership Agreements",
  "Performance Appraisals",
  "Performance Improvement Plans",
  "Permit & License Documents",
  "Policies & Procedures",
  "Pre-Award Assessments",
  "Procurement & Tender Documents",
  "Project Proposals",
  "Quality Assurance Documents",
  "Recruitment & Selection Records",
  "Regulatory Compliance Documents",
  "Research Books",
  "Research Papers",
  "Risk Registers",
  "Safeguarding Policies & Reports",
  "Staff Handbooks",
  "Stakeholder Mapping & Analysis",
  "Standard Operating Procedures (SOPs)",
  "Strategic Plans",
  "Sustainability Reports",
  "Technical Specifications",
  "Terms of Reference (ToRs)",
  "Training Materials",
  "Travel Reports",
  "User Manuals & Guides",
  "Vendor & Supplier Records",
  "Volunteer Management Records",
  "Waste Management Plans",
  "Workshop & Conference Materials",
  "Workplans & Activity Schedules"
];

// Valid security classifications 
const validSecurityClassifications = ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "SECRET", "TOP_SECRET"];

// Validate AI suggestions against our predefined lists
const validateAISuggestions = (analysis: any) => {
  const validated = { ...analysis };
  
  // Validate suggested category
  if (analysis.suggestedCategory && !validDocumentCategories.includes(analysis.suggestedCategory)) {
    console.warn(`Invalid suggested category: ${analysis.suggestedCategory}, defaulting to current category`);
    validated.suggestedCategory = null;
  }
  
  // Validate suggested classification
  if (analysis.suggestedClassification && !validSecurityClassifications.includes(analysis.suggestedClassification)) {
    console.warn(`Invalid suggested classification: ${analysis.suggestedClassification}, defaulting to INTERNAL`);
    validated.suggestedClassification = 'INTERNAL';
  }
  
  return validated;
};

const detectLanguage = (filename: string, content?: string) => {
  // Simple language detection based on filename and content patterns
  const filename_lower = filename.toLowerCase()
  
  if (filename_lower.includes('swahili') || filename_lower.includes('kiswahili')) return 'Swahili'
  if (filename_lower.includes('french') || filename_lower.includes('francais')) return 'French'
  if (filename_lower.includes('arabic') || filename_lower.includes('عربي')) return 'Arabic'
  if (filename_lower.includes('spanish') || filename_lower.includes('español')) return 'Spanish'
  
  // Default to English for most organizational documents
  return 'English'
}

const analyzeSecurityClassification = (filename: string, category: string) => {
  const filename_lower = filename.toLowerCase()
  const category_lower = category.toLowerCase()
  
  // High security indicators
  const highSecurityKeywords = [
    'confidential', 'secret', 'restricted', 'classified', 'private', 'sensitive',
    'salary', 'payroll', 'contract', 'financial', 'budget', 'audit',
    'personnel', 'hr', 'disciplinary', 'termination', 'medical',
    'legal', 'lawsuit', 'compliance', 'investigation'
  ]
  
  // Medium security indicators
  const mediumSecurityKeywords = [
    'internal', 'staff', 'employee', 'management', 'board', 'strategic',
    'planning', 'policy', 'procedure', 'meeting', 'minutes'
  ]
  
  // Public indicators
  const publicKeywords = [
    'public', 'announcement', 'press', 'newsletter', 'brochure',
    'annual report', 'publication', 'marketing', 'promotional'
  ]
  
  const hasHighSecurity = highSecurityKeywords.some(keyword => 
    filename_lower.includes(keyword) || category_lower.includes(keyword)
  )
  const hasMediumSecurity = mediumSecurityKeywords.some(keyword => 
    filename_lower.includes(keyword) || category_lower.includes(keyword)
  )
  const hasPublic = publicKeywords.some(keyword => 
    filename_lower.includes(keyword) || category_lower.includes(keyword)
  )
  
  if (hasHighSecurity) return { level: 'CONFIDENTIAL', confidence: 0.8 }
  if (hasMediumSecurity) return { level: 'INTERNAL', confidence: 0.6 }
  if (hasPublic) return { level: 'PUBLIC', confidence: 0.9 }
  
  // Default classification based on category
  if (category_lower.includes('hr') || category_lower.includes('financial')) {
    return { level: 'CONFIDENTIAL', confidence: 0.7 }
  }
  if (category_lower.includes('internal') || category_lower.includes('management')) {
    return { level: 'INTERNAL', confidence: 0.6 }
  }
  
  return { level: 'INTERNAL', confidence: 0.5 } // Default for organizational docs
}

const generateSmartSummary = (filename: string, category: string, fileType: string) => {
  const category_lower = category.toLowerCase()
  const filename_base = filename.substring(0, filename.lastIndexOf('.')) || filename
  
  if (category_lower.includes('report')) {
    return `Analysis of ${filename_base}: This appears to be a ${category} containing structured information and data analysis. Document type: ${fileType}.`
  }
  if (category_lower.includes('contract') || category_lower.includes('agreement')) {
    return `Legal document analysis: ${filename_base} is a ${category} requiring careful review and approval processes. Security classification recommended based on content sensitivity.`
  }
  if (category_lower.includes('policy') || category_lower.includes('procedure')) {
    return `Organizational document: ${filename_base} defines ${category} guidelines for operational compliance and standardization across departments.`
  }
  if (category_lower.includes('financial') || category_lower.includes('budget')) {
    return `Financial document analysis: ${filename_base} contains ${category} information requiring restricted access and confidential handling.`
  }
  if (category_lower.includes('hr') || category_lower.includes('employee')) {
    return `Human resources document: ${filename_base} contains ${category} information with privacy implications requiring appropriate access controls.`
  }
  
  return `Document analysis: ${filename_base} has been classified as ${category} and processed for intelligent categorization and security assessment.`
}

const calculateReadabilityScore = (filename: string, category: string) => {
  // Simulate readability based on document type and category
  const category_lower = category.toLowerCase()
  
  if (category_lower.includes('technical') || category_lower.includes('manual')) return 0.3
  if (category_lower.includes('legal') || category_lower.includes('contract')) return 0.4
  if (category_lower.includes('policy') || category_lower.includes('procedure')) return 0.6
  if (category_lower.includes('report') || category_lower.includes('analysis')) return 0.7
  if (category_lower.includes('newsletter') || category_lower.includes('announcement')) return 0.9
  
  return 0.65 // Default readable score
}

const analyzeSentiment = (filename: string, category: string) => {
  const filename_lower = filename.toLowerCase()
  const category_lower = category.toLowerCase()
  
  // Negative indicators
  if (filename_lower.includes('termination') || filename_lower.includes('disciplinary') || 
      filename_lower.includes('complaint') || filename_lower.includes('violation')) {
    return { score: 0.2, label: 'Negative' }
  }
  
  // Positive indicators
  if (filename_lower.includes('achievement') || filename_lower.includes('success') || 
      filename_lower.includes('award') || filename_lower.includes('promotion') ||
      category_lower.includes('achievement') || category_lower.includes('award')) {
    return { score: 0.9, label: 'Very Positive' }
  }
  
  // Neutral-positive for most organizational docs
  return { score: 0.65, label: 'Positive' }
}

const generateKeyTopics = (filename: string, category: string) => {
  const topics = []
  const filename_lower = filename.toLowerCase()
  const category_lower = category.toLowerCase()
  
  // Extract topics from filename and category
  if (filename_lower.includes('budget') || category_lower.includes('financial')) topics.push('Financial Management')
  if (filename_lower.includes('hr') || category_lower.includes('employee')) topics.push('Human Resources')
  if (filename_lower.includes('training') || category_lower.includes('training')) topics.push('Staff Development')
  if (filename_lower.includes('project') || category_lower.includes('project')) topics.push('Project Management')
  if (filename_lower.includes('policy') || category_lower.includes('policy')) topics.push('Organizational Policy')
  if (filename_lower.includes('compliance') || category_lower.includes('audit')) topics.push('Compliance')
  if (filename_lower.includes('report') || category_lower.includes('report')) topics.push('Reporting')
  
  // Add category as a topic if not already covered
  if (topics.length === 0) {
    topics.push(category)
  }
  
  return topics
}

// Advanced GPT-powered analysis
const getGPTAnalysis = async (filename: string, category: string, title: string, fileType: string) => {
  if (!openai) {
    console.log('⚠️ OpenAI not configured, using intelligent fallback analysis')
    return null
  }

  if (now() < openAICooldownUntil) {
    openAIQuotaExceeded = true
    const remainingMs = openAICooldownUntil - now()
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000))
    console.warn(`⚠️ Skipping GPT analysis due to cooldown (${remainingMinutes} minute(s) remaining)`)
    return null
  }

  try {
    const prompt = `Analyze this document for a professional organization:
    
Filename: ${filename}
Title: ${title}
Current Category: ${category}
File Type: ${fileType}

Available Document Categories: ${validDocumentCategories.join(', ')}

Please provide a JSON response with the following analysis:
{
  "summary": "A professional 2-3 sentence summary of what this document likely contains based on the filename, title, and category",
  "suggestedCategory": "Choose the MOST appropriate category from the Available Document Categories list above",
  "suggestedClassification": "PUBLIC|INTERNAL|CONFIDENTIAL|SECRET - choose based on document type and content sensitivity",
  "keyTopics": ["topic1", "topic2", "topic3"] - 3-5 relevant topics,
  "suggestedTags": ["tag1", "tag2", "tag3"] - 5-7 searchable tags,
  "securityRisks": ["risk1", "risk2"] - any potential security concerns (empty array if none),
  "readabilityScore": 0.0-1.0 - estimated readability (0.3=technical, 0.7=professional, 0.9=general audience),
  "sentimentScore": 0.0-1.0 - estimated sentiment (0.3=negative/sensitive, 0.7=neutral-positive, 0.9=very positive),
  "language": "English|Swahili|French|etc" - detected language,
  "priority": "LOW|MEDIUM|HIGH" - business priority level,
  "confidenceScore": 0.0-1.0 - how confident this analysis is
}

IMPORTANT: 
- suggestedCategory MUST be exactly one of the categories from the Available Document Categories list
- suggestedClassification MUST be exactly one of: PUBLIC, INTERNAL, CONFIDENTIAL, SECRET

Focus on organizational context - this is for SAYWHAT organization document management. Be practical and accurate.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 800
    })

    const response = completion.choices[0]?.message?.content?.trim()
    if (!response) {
      throw new Error('No response from GPT')
    }

    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in GPT response')
    }

    const gptAnalysis = JSON.parse(jsonMatch[0])
    console.log('🤖 GPT Analysis successful:', gptAnalysis)
    
    // Validate AI suggestions against our predefined lists
    const validatedAnalysis = validateAISuggestions(gptAnalysis)
    return validatedAnalysis

  } catch (error: any) {
    if (isRateLimitOrQuotaError(error)) {
      openAIQuotaExceeded = true
      openAICooldownUntil = now() + AI_COOLDOWN_MS
      console.error('⏳ GPT quota exceeded, applying cooldown fallback', error)
    } else {
      console.error('❌ GPT Analysis error:', error)
    }
    return null
  }
}

// Advanced Gemini-powered analysis
const getGeminiAnalysis = async (filename: string, category: string, title: string, fileType: string) => {
  if (!gemini) {
    console.log('⚠️ Gemini not configured')
    return null
  }

  if (now() < geminiCooldownUntil) {
    geminiQuotaExceeded = true
    const remainingMs = geminiCooldownUntil - now()
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000))
    console.warn(`⚠️ Skipping Gemini analysis due to cooldown (${remainingMinutes} minute(s) remaining)`)
    return null
  }

  try {
    // Try different Gemini models in order of preference
    let model
    try {
      // Try basic model first (most likely to be available)
      model = gemini.getGenerativeModel({ model: "gemini-pro" })
    } catch (basicError) {
      try {
        console.warn('Gemini Pro not available, trying 1.0 Pro...')
        model = gemini.getGenerativeModel({ model: "gemini-1.0-pro" })
      } catch (legacyError) {
        try {
          console.warn('Gemini 1.0 Pro not available, trying text-bison...')
          model = gemini.getGenerativeModel({ model: "text-bison-001" })
        } catch (finalError) {
          console.error('No Gemini models available:', finalError)
          return null
        }
      }
    }
    
    const prompt = `You are an expert document analyst for SAYWHAT organization. Analyze this document and provide insights:

Document Details:
- Filename: ${filename}
- Title: ${title}
- Current Category: ${category}
- File Type: ${fileType}

Available Document Categories: ${validDocumentCategories.join(', ')}

Provide ONLY a JSON response with this exact structure:
{
  "summary": "Professional 2-3 sentence summary of document purpose and content",
  "suggestedCategory": "Choose the MOST appropriate category from the Available Document Categories list above",
  "suggestedClassification": "PUBLIC or INTERNAL or CONFIDENTIAL or SECRET",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "securityRisks": ["risk1", "risk2"] or [],
  "readabilityScore": 0.75,
  "sentimentScore": 0.65,
  "language": "English",
  "priority": "LOW or MEDIUM or HIGH",
  "confidenceScore": 0.85,
  "insights": ["insight1", "insight2"]
}

IMPORTANT: 
- suggestedCategory MUST be exactly one of the categories from the Available Document Categories list
- suggestedClassification MUST be exactly one of: PUBLIC, INTERNAL, CONFIDENTIAL, SECRET

Consider organizational context - this is for a professional NGO/organization. Focus on:
- Security classification based on content sensitivity
- Business priority based on document importance
- Relevant topics for searchability
- Actionable insights for document management`

    const result = await model.generateContent(prompt)
    const response = result.response.text().trim()
    
    if (!response) {
      throw new Error('No response from Gemini')
    }

    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response')
    }

    const geminiAnalysis = JSON.parse(jsonMatch[0])
    console.log('🚀 Gemini Analysis successful:', geminiAnalysis)
    
    // Validate AI suggestions against our predefined lists
    const validatedAnalysis = validateAISuggestions(geminiAnalysis)
    return validatedAnalysis

  } catch (error: any) {
    if (isRateLimitOrQuotaError(error)) {
      geminiQuotaExceeded = true
      geminiCooldownUntil = now() + AI_COOLDOWN_MS
      console.error('⏳ Gemini quota exceeded, applying cooldown fallback', error)
    } else {
      console.error('❌ Gemini Analysis error:', error)
    }
    return null
  }
}

// Hybrid AI Analysis - combines multiple AI providers for best results
const getHybridAIAnalysis = async (filename: string, category: string, title: string, fileType: string) => {
  console.log('🤖 Starting Hybrid AI Analysis (GPT + Gemini)...')
  
  // Run both analyses in parallel for speed, with proper error handling
  const [gptAnalysis, geminiAnalysis] = await Promise.allSettled([
    openai ? getGPTAnalysis(filename, category, title, fileType) : Promise.resolve(null),
    gemini ? getGeminiAnalysis(filename, category, title, fileType) : Promise.resolve(null)
  ])

  const resolvedGptAnalysis = gptAnalysis.status === 'fulfilled' ? gptAnalysis.value : null
  const resolvedGeminiAnalysis = geminiAnalysis.status === 'fulfilled' ? geminiAnalysis.value : null

  // If we have both analyses, combine them intelligently
  if (resolvedGptAnalysis && resolvedGeminiAnalysis) {
    console.log('✨ Combining GPT and Gemini insights for ultimate analysis')
    
    // Combine tags from both AIs (remove duplicates)
    const combinedTags = [...new Set([
      ...(resolvedGptAnalysis.suggestedTags || []),
      ...(resolvedGeminiAnalysis.suggestedTags || [])
    ])].slice(0, 8) // Keep best 8 tags

    // Combine topics from both AIs (remove duplicates)
    const combinedTopics = [...new Set([
      ...(resolvedGptAnalysis.keyTopics || []),
      ...(resolvedGeminiAnalysis.keyTopics || [])
    ])].slice(0, 6) // Keep best 6 topics

    // Combine security risks from both AIs
    const combinedRisks = [...new Set([
      ...(resolvedGptAnalysis.securityRisks || []),
      ...(resolvedGeminiAnalysis.securityRisks || [])
    ])]

    // Use consensus for classification (if both agree) or default to more secure
    let finalClassification = resolvedGptAnalysis.suggestedClassification
    if (resolvedGptAnalysis.suggestedClassification !== resolvedGeminiAnalysis.suggestedClassification) {
      // Default to more secure classification
      if (resolvedGptAnalysis.suggestedClassification === 'CONFIDENTIAL' || resolvedGeminiAnalysis.suggestedClassification === 'CONFIDENTIAL') {
        finalClassification = 'CONFIDENTIAL'
      } else if (resolvedGptAnalysis.suggestedClassification === 'INTERNAL' || resolvedGeminiAnalysis.suggestedClassification === 'INTERNAL') {
        finalClassification = 'INTERNAL'
      }
    }

    // Average numerical scores
    const avgReadability = ((resolvedGptAnalysis.readabilityScore || 0.5) + (resolvedGeminiAnalysis.readabilityScore || 0.5)) / 2
    const avgSentiment = ((resolvedGptAnalysis.sentimentScore || 0.5) + (resolvedGeminiAnalysis.sentimentScore || 0.5)) / 2
    const avgConfidence = ((resolvedGptAnalysis.confidenceScore || 0.5) + (resolvedGeminiAnalysis.confidenceScore || 0.5)) / 2

    // Use the better summary (longer and more detailed)
    const finalSummary = (resolvedGptAnalysis.summary?.length || 0) > (resolvedGeminiAnalysis.summary?.length || 0) 
      ? resolvedGptAnalysis.summary 
      : resolvedGeminiAnalysis.summary

    // Use consensus for priority or default to higher priority
    let finalPriority = resolvedGptAnalysis.priority || 'MEDIUM'
    if (resolvedGptAnalysis.priority !== resolvedGeminiAnalysis.priority) {
      if (resolvedGptAnalysis.priority === 'HIGH' || resolvedGeminiAnalysis.priority === 'HIGH') {
        finalPriority = 'HIGH'
      } else if (resolvedGptAnalysis.priority === 'MEDIUM' || resolvedGeminiAnalysis.priority === 'MEDIUM') {
        finalPriority = 'MEDIUM'
      }
    }

    return {
      summary: finalSummary,
      suggestedTags: combinedTags,
      suggestedClassification: finalClassification,
      keyTopics: combinedTopics,
      securityRisks: combinedRisks,
      readabilityScore: avgReadability,
      sentimentScore: avgSentiment,
      language: resolvedGptAnalysis.language || resolvedGeminiAnalysis.language || 'English',
      priority: finalPriority,
      confidenceScore: avgConfidence,
      insights: resolvedGeminiAnalysis.insights || [],
      analysisMethod: 'Hybrid AI (GPT + Gemini)',
      aiProviders: ['GPT-3.5-turbo', 'Gemini-1.5-Flash']
    }
  }

  // If only one AI is available, return that analysis
  if (resolvedGptAnalysis) {
    return { 
      ...resolvedGptAnalysis, 
      analysisMethod: 'GPT-Enhanced',
      aiProviders: ['GPT-3.5-turbo']
    }
  }
  
  if (resolvedGeminiAnalysis) {
    return { 
      ...resolvedGeminiAnalysis, 
      analysisMethod: 'Gemini-Enhanced',
      aiProviders: ['Gemini-1.5-Flash']
    }
  }

  return null // No AI analysis available
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'General Document'
    const title = formData.get('title') as string || file.name
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }

    console.log(`🤖 AI Analysis starting for: ${file.name} (Category: ${category})`)
    
    // Intelligent analysis based on file properties
    const fileTypeAnalysis = analyzeFileType(file)
    const language = detectLanguage(file.name, title)
    const securityAnalysis = analyzeSecurityClassification(file.name, category)
    const readabilityScore = calculateReadabilityScore(file.name, category)
    const sentimentAnalysis = analyzeSentiment(file.name, category)
    const keyTopics = generateKeyTopics(file.name, category)
    const smartSummary = generateSmartSummary(file.name, category, fileTypeAnalysis.type)
    
    // Try to get advanced Hybrid AI analysis (GPT + Gemini)
    let hybridAnalysis = null
    if (openai || gemini) {
      hybridAnalysis = await getHybridAIAnalysis(file.name, category, title, fileTypeAnalysis.type)
    }

    const warnings: string[] = []

    if (!openai && !gemini) {
      warnings.push('AI providers are not configured; using rule-based analysis.')
    }

    if (openAIQuotaExceeded) {
      warnings.push('OpenAI quota exceeded; GPT analysis temporarily disabled. Falling back to rule-based insights.')
      openAIQuotaExceeded = false
    }

    if (geminiQuotaExceeded) {
      warnings.push('Google Gemini quota exceeded; hybrid analysis partially unavailable.')
      geminiQuotaExceeded = false
    }
    
    // Generate intelligent tags (use Hybrid AI tags if available, fallback to rule-based)
    const suggestedTags = hybridAnalysis?.suggestedTags || [
      fileTypeAnalysis.category,
      language,
      category,
      ...keyTopics.slice(0, 3)
    ].filter((tag, index, self) => self.indexOf(tag) === index) // Remove duplicates
    
    // Security risk assessment (combine Hybrid AI and rule-based)
    let securityRisks = []
    if (hybridAnalysis?.securityRisks) {
      securityRisks = hybridAnalysis.securityRisks
    } else {
      if (securityAnalysis.level === 'CONFIDENTIAL') {
        securityRisks.push('Contains sensitive information requiring restricted access')
      }
      if (file.name.toLowerCase().includes('password') || file.name.toLowerCase().includes('key')) {
        securityRisks.push('Filename suggests potential security credentials')
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        securityRisks.push('Large file size may contain extensive sensitive data')
      }
    }
    
    // Use Hybrid AI analysis when available, fallback to rule-based analysis
    const analysisResult = {
      summary: hybridAnalysis?.summary || smartSummary,
      suggestedTags: suggestedTags,
      suggestedClassification: hybridAnalysis?.suggestedClassification || securityAnalysis.level,
      classificationConfidence: hybridAnalysis?.confidenceScore || securityAnalysis.confidence,
      contentType: fileTypeAnalysis.type,
      language: hybridAnalysis?.language || language,
      readabilityScore: hybridAnalysis?.readabilityScore || readabilityScore,
      sentimentScore: hybridAnalysis?.sentimentScore || sentimentAnalysis.score,
      sentimentLabel: hybridAnalysis?.sentimentScore ? 
        (hybridAnalysis.sentimentScore > 0.7 ? 'Very Positive' : 
         hybridAnalysis.sentimentScore > 0.5 ? 'Positive' : 
         hybridAnalysis.sentimentScore > 0.3 ? 'Neutral' : 'Negative') : 
        sentimentAnalysis.label,
      keyTopics: hybridAnalysis?.keyTopics || keyTopics,
      securityRisks: securityRisks,
      priority: hybridAnalysis?.priority || 'MEDIUM',
      insights: (hybridAnalysis as any)?.insights || [],
      fileSize: file.size,
      fileName: file.name,
      analysisTimestamp: new Date().toISOString(),
      analysisMethod: hybridAnalysis?.analysisMethod || 'Rule-Based Intelligence',
      aiProviders: (hybridAnalysis as any)?.aiProviders || [],
      hybridAnalysisUsed: !!hybridAnalysis,
      warnings
    }
    
    console.log(`✅ AI Analysis complete:`, analysisResult)
    
    return NextResponse.json({
      success: true,
      analysis: analysisResult
    })
    
  } catch (error) {
    console.error('❌ AI Analysis error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}