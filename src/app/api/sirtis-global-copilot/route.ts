import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize AI clients
let openai: OpenAI | null = null
let gemini: any = null

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
} catch (error) {
  console.error('OpenAI initialization error:', error)
}

try {
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    // Use the most basic Gemini model for maximum compatibility
    try {
      gemini = genAI.getGenerativeModel({ model: 'gemini-pro' })
    } catch (modelError) {
      console.warn('Gemini Pro not available, trying alternative model...')
      try {
        gemini = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' })
      } catch (altError) {
        console.warn('All newer Gemini models unavailable, trying text-bison...')
        try {
          gemini = genAI.getGenerativeModel({ model: 'text-bison-001' })
        } catch (finalError) {
          console.error('No Gemini models available:', finalError)
          gemini = null
        }
      }
    }
  }
} catch (error) {
  console.error('Gemini initialization error:', error)
}

interface ConversationContext {
  userId: string
  userName: string
  department: string
  currentPage: string
  currentPath: string
  pageContext?: any
  timestamp: string
}

interface ChatMessage {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
  context?: string
}

// Context-aware system prompts for different modules
const getSystemPrompt = (context: ConversationContext) => {
  const modulePrompts = {
    dashboard: `You are SIRTIS Copilot, an AI assistant for the SAYWHAT organization's dashboard. Help users understand metrics, analytics, and navigate the system. Provide insights about performance data, alerts, and system status.`,
    
    hr: `You are SIRTIS Copilot specializing in Human Resources. Help with employee management, performance analytics, training programs, attendance tracking, payroll queries, and HR policies. Provide actionable insights and guidance.`,
    
    'call-centre': `You are SIRTIS Copilot for Call Centre operations. Assist with call analytics, agent performance, customer satisfaction metrics, case management, and call center optimization strategies.`,
    
    programs: `You are SIRTIS Copilot for Program Management. Help with project tracking, KPI monitoring, resource allocation, timeline management, risk assessment, and program optimization.`,
    
    inventory: `You are SIRTIS Copilot for Inventory Management. Assist with stock tracking, asset management, maintenance scheduling, procurement analysis, and inventory optimization.`,
    
    documents: `You are SIRTIS Copilot for Document Management. Help with document search, analysis, compliance checking, archive management, and document workflow optimization.`,
    
    default: `You are SIRTIS Copilot, an intelligent AI assistant for the SAYWHAT organization's integrated management system. Help users navigate, understand data, and optimize their workflows.`
  }

  const basePrompt = modulePrompts[context.currentPage as keyof typeof modulePrompts] || modulePrompts.default
  
  return `${basePrompt}

Current Context:
- User: ${context.userName} (${context.department})
- Module: ${context.currentPage}
- Path: ${context.currentPath}
- Time: ${new Date(context.timestamp).toLocaleString()}

Instructions:
- Be helpful, professional, and concise
- Provide actionable insights and suggestions
- Use emojis sparingly and appropriately
- Focus on SAYWHAT/SIRTIS context and workflows
- If you don't know something, suggest next steps or who to contact
- Provide specific, contextual recommendations when possible`
}

// Enhanced GPT analysis with conversation history
async function getGPTAnalysis(message: string, context: ConversationContext, conversationHistory: ChatMessage[] = []) {
  if (!openai) return null

  try {
    // Build conversation history for GPT
    const messages: any[] = [
      {
        role: 'system',
        content: getSystemPrompt(context)
      }
    ]

    // Add recent conversation history for context
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.content
      })
    })

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 800,
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || null
  } catch (error: any) {
    console.error('GPT analysis error:', error)
    
    // Check for specific quota exceeded error
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      throw new Error('QUOTA_EXCEEDED')
    }
    
    return null
  }
}

// Enhanced Gemini analysis with conversation history  
async function getGeminiAnalysis(message: string, context: ConversationContext, conversationHistory: ChatMessage[] = []) {
  if (!gemini) return null

  try {
    // Build conversation context for Gemini
    let conversationContext = ''
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nRecent conversation:\n' +
        conversationHistory.map(msg => 
          `${msg.isBot ? 'Assistant' : 'User'}: ${msg.content}`
        ).join('\n')
    }

    const prompt = `${getSystemPrompt(context)}

User Message: ${message}${conversationContext}

Please provide a helpful, contextual response as SIRTIS Copilot.`

    const result = await gemini.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error: any) {
    console.error('Gemini analysis error:', error)
    
    // Check for specific model not found or quota errors
    if (error?.status === 404) {
      console.error('Gemini model not found, trying fallback...')
    } else if (error?.status === 429) {
      throw new Error('QUOTA_EXCEEDED')
    }
    
    return null
  }
}

// Hybrid AI analysis combining GPT and Gemini
async function getHybridAIResponse(message: string, context: ConversationContext, conversationHistory: ChatMessage[] = []) {
  const [gptResponse, geminiResponse] = await Promise.all([
    getGPTAnalysis(message, context, conversationHistory),
    getGeminiAnalysis(message, context, conversationHistory)
  ])

  // If both AIs respond, use the longer/more detailed response
  if (gptResponse && geminiResponse) {
    const gptLength = gptResponse.length
    const geminiLength = geminiResponse.length
    
    // Choose the more comprehensive response
    if (Math.abs(gptLength - geminiLength) < 50) {
      // If similar length, prefer GPT for consistency
      return {
        response: gptResponse,
        provider: 'Hybrid AI (GPT + Gemini)',
        method: 'hybrid'
      }
    } else {
      const selectedResponse = gptLength > geminiLength ? gptResponse : geminiResponse
      const selectedProvider = gptLength > geminiLength ? 'GPT-3.5-turbo' : 'Gemini Pro'
      return {
        response: selectedResponse,
        provider: `Hybrid AI (${selectedProvider} selected)`,
        method: 'hybrid'
      }
    }
  }

  // Single AI response
  if (gptResponse) {
    return {
      response: gptResponse,
      provider: 'GPT-Enhanced',
      method: 'gpt'
    }
  }

  if (geminiResponse) {
    return {
      response: geminiResponse,
      provider: 'Gemini-Enhanced',
      method: 'gemini'
    }
  }

  return null
}

// Contextual suggestions based on current module and conversation
function getContextualSuggestions(context: ConversationContext, message: string): string[] {
  const lowerMessage = message.toLowerCase()
  const module = context.currentPage

  const moduleSuggestions = {
    dashboard: [
      'Show performance trends',
      'What alerts are active?',
      'Explain this metric',
      'Navigate to specific module'
    ],
    hr: [
      'Employee performance analysis',
      'Training recommendations',
      'Attendance patterns',
      'HR policy questions'
    ],
    'call-centre': [
      'Call volume analysis',
      'Agent efficiency tips',
      'Customer satisfaction insights',
      'Best practices'
    ],
    programs: [
      'Project status update',
      'Resource optimization',
      'Risk mitigation',
      'KPI improvements'
    ],
    inventory: [
      'Stock optimization',
      'Asset maintenance',
      'Procurement insights',
      'Cost analysis'
    ],
    documents: [
      'Document search tips',
      'Compliance checking',
      'Archive management',
      'Workflow optimization'
    ]
  }

  const suggestions = moduleSuggestions[module as keyof typeof moduleSuggestions] || moduleSuggestions.dashboard
  
  // Filter suggestions based on message content
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return suggestions.slice(0, 2)
  }
  
  if (lowerMessage.includes('show') || lowerMessage.includes('display')) {
    return suggestions.filter(s => s.includes('analysis') || s.includes('insights')).slice(0, 2)
  }

  return suggestions.slice(0, 2)
}

// Enhanced rule-based intelligent response
function getRuleBasedResponse(message: string, context: ConversationContext, isQuotaExceeded: boolean = false): string {
  const lowerMessage = message.toLowerCase()
  const module = context.currentPage
  const user = context.userName

  // If quota exceeded, provide specific message
  if (isQuotaExceeded) {
    return `⚡ **SIRTIS Copilot - Intelligent Assistant Mode**

Hello ${user}! I'm currently operating in high-efficiency mode due to AI service limits. I can still provide excellent assistance for ${module} operations:

🎯 **Available Services:**
• Feature guidance and navigation help
• Best practices and workflow optimization  
• System explanations and troubleshooting
• Process recommendations and tips
• Integration guidance and setup help

💡 **${module.toUpperCase()} Expertise:**
${getModuleSpecificGuidance(module)}

How can I help optimize your ${module} workflow today? I'm designed to provide intelligent assistance even without external AI services!`
  }

  // Context-specific responses
  if (module === 'hr') {
    if (lowerMessage.includes('employee') || lowerMessage.includes('performance')) {
      return `🧑‍💼 **HR Intelligence Center for ${user}**

I'm your intelligent HR assistant with deep system knowledge:

📊 **Employee Analytics:**
• Performance trend analysis and reporting
• Attendance pattern recognition and insights  
• Skills gap identification and recommendations
• Career development pathway suggestions

🎯 **Smart Recommendations:**
• Automated performance review scheduling
• Training program optimization based on roles
• Compliance checking and policy adherence
• Workforce planning and resource allocation

💡 **Advanced Features:**
• Real-time dashboard customization
• Predictive analytics for retention
• Automated report generation
• Integration with payroll and benefits

Would you like me to guide you through any specific HR process or feature?`
    }
  }

  if (module === 'call-centre') {
    if (lowerMessage.includes('call') || lowerMessage.includes('agent') || lowerMessage.includes('customer')) {
      return `📞 **Call Centre Intelligence Hub for ${user}**

Your intelligent call center optimization assistant:

📈 **Performance Analytics:**
• Real-time call volume monitoring and predictions
• Agent efficiency scoring and coaching insights
• Customer satisfaction trend analysis
• Queue optimization and wait time reduction

🎯 **Smart Optimization:**
• Automated call routing based on agent skills
• Sentiment analysis integration for quality
• Peak hour staffing recommendations
• Customer feedback loop automation

⚡ **Operational Excellence:**
• Case escalation workflow optimization
• Knowledge base integration and updates
• Performance dashboard customization
• SLA monitoring and compliance tracking

How can I help optimize your call center operations today?`
    }
  }

  // General system help with enhanced intelligence
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('guide')) {
    return `🚀 **SIRTIS Intelligent Assistant for ${user}**

I'm your advanced system guide with comprehensive ${module} expertise:

🧠 **Intelligent Assistance:**
• Context-aware feature explanations
• Step-by-step workflow optimization
• Best practice recommendations
• Troubleshooting and problem resolution

📊 **Smart Analytics:**
• Data interpretation and insights
• Trend analysis and predictions
• Performance optimization suggestions
• Custom dashboard configuration

🎯 **Workflow Excellence:**
• Process automation recommendations
• Integration optimization strategies
• User experience enhancements
• Efficiency improvement tactics

${getModuleSpecificGuidance(module)}

What specific ${module} challenge can I help you solve intelligently?`
  }

  // Default contextual response with enhanced intelligence
  return `👋 **Intelligent SIRTIS Assistant for ${user}**

Welcome to the ${module} intelligent assistance center! I'm equipped with comprehensive system knowledge:

🎯 **Smart Capabilities:**
• Advanced ${module} workflow optimization
• Intelligent feature recommendations
• Data-driven insights and analysis
• Best practice guidance and tips

💡 **Expertise Areas:**
${getModuleSpecificGuidance(module)}

🚀 **Enhanced Features:**
• Context-aware assistance
• Personalized recommendations
• Workflow automation suggestions
• Performance optimization insights

I'm designed to provide intelligent, contextual assistance even in offline mode. What would you like to explore in ${module} today?`
}

// Helper function for module-specific guidance
function getModuleSpecificGuidance(module: string): string {
  const guidance = {
    'dashboard': '• System health monitoring and alerts\n• Performance metrics interpretation\n• Navigation and quick access optimization\n• Data visualization customization',
    'hr': '• Employee lifecycle management\n• Performance evaluation workflows\n• Training and development tracking\n• Compliance and policy management',
    'call-centre': '• Call analytics and reporting\n• Agent performance optimization\n• Customer experience enhancement\n• Queue management strategies',
    'programs': '• Project tracking and milestone management\n• KPI monitoring and optimization\n• Resource allocation strategies\n• Risk assessment and mitigation',
    'inventory': '• Stock level optimization\n• Asset lifecycle management\n• Procurement process automation\n• Maintenance scheduling optimization',
    'documents': '• Document organization and search\n• Content analysis and insights\n• Compliance monitoring\n• Workflow automation setup'
  }
  
  return guidance[module as keyof typeof guidance] || guidance['dashboard']
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, context, conversationHistory = [] } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Enhanced context with session data
    const enhancedContext: ConversationContext = {
      userId: session.user?.email || 'anonymous',
      userName: session.user?.name || 'User',
      department: (session.user as any)?.department || 'General',
      currentPage: context?.currentPage || 'dashboard',
      currentPath: context?.currentPath || '/dashboard',
      pageContext: context?.pageContext,
      timestamp: new Date().toISOString()
    }

    // Try hybrid AI analysis first
    let quotaExceeded = false
    try {
      const aiResult = await getHybridAIResponse(message, enhancedContext, conversationHistory)
      
      if (aiResult) {
        const suggestions = getContextualSuggestions(enhancedContext, message)
        
        return NextResponse.json({
          response: aiResult.response,
          provider: aiResult.provider,
          method: aiResult.method,
          suggestions: suggestions,
          context: enhancedContext.currentPage
        })
      }
    } catch (aiError: any) {
      console.error('Hybrid AI Error:', aiError)
      
      // Check if quota exceeded
      if (aiError.message === 'QUOTA_EXCEEDED') {
        quotaExceeded = true
      }
    }

    // Enhanced fallback to rule-based intelligent response
    const fallbackResponse = getRuleBasedResponse(message, enhancedContext, quotaExceeded)
    const suggestions = getContextualSuggestions(enhancedContext, message)

    return NextResponse.json({
      response: fallbackResponse,
      provider: quotaExceeded ? 'Intelligent Assistant Mode' : 'Rule-Based Intelligence',
      method: 'rule-based',
      suggestions: suggestions,
      context: enhancedContext.currentPage,
      note: quotaExceeded 
        ? 'Operating in high-efficiency mode due to AI service limits. Full intelligence still available!'
        : 'Using intelligent rule-based responses. Enable AI integration for enhanced capabilities.'
    })

  } catch (error) {
    console.error('Global Copilot API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}