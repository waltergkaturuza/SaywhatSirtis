import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, context } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Initialize AI service with server-side API key
    const aiConfig = {
      openAI: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-3.5-turbo' as const,
        maxTokens: 500
      }
    }

    if (!aiConfig.openAI.apiKey) {
      // Return contextual demo response when API key is not configured
      const demoResponse = getContextualDemoResponse(message, context?.currentPage || 'dashboard')
      return NextResponse.json({ response: demoResponse })
    }

    try {
      const aiService = new AIService(aiConfig)
      
      // Enhance context with session data
      const enhancedContext = {
        userId: session.user?.email || 'anonymous',
        department: (session.user as any)?.department || 'General',
        currentPage: context?.currentPage || 'dashboard',
        recentActions: context?.recentActions || []
      }

      const response = await aiService.getChatbotResponse(message, enhancedContext)
      
      return NextResponse.json({ response })
    } catch (aiError) {
      console.error('AI Service Error:', aiError)
      const fallbackResponse = getContextualDemoResponse(message, context?.currentPage || 'dashboard')
      return NextResponse.json({ 
        response: fallbackResponse,
        note: 'AI service unavailable, using demo mode'
      })
    }

  } catch (error) {
    console.error('Chatbot API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getContextualDemoResponse(message: string, currentPage: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Context-aware responses based on current page
  if (currentPage === 'hr' || currentPage === 'dashboard') {
    if (lowerMessage.includes('employee') || lowerMessage.includes('hr') || lowerMessage.includes('performance')) {
      return `🧑‍💼 **HR Insights Available**

I can help you with:
• Employee performance analytics and predictions
• Attendance tracking and patterns
• Skills assessment and development recommendations
• Payroll processing and compliance

*Currently showing demo data. For full AI analytics, contact your administrator to enable OpenAI integration.*`
    }
  }
  
  if (currentPage === 'programs' || currentPage === 'projects') {
    if (lowerMessage.includes('project') || lowerMessage.includes('program') || lowerMessage.includes('kpi')) {
      return `📊 **Project Management Support**

I can assist with:
• Project timeline analysis and milestone tracking
• KPI monitoring and performance insights
• Resource allocation optimization
• Risk assessment and mitigation strategies

*Advanced predictive analytics available with full AI integration.*`
    }
  }
  
  if (currentPage === 'inventory') {
    if (lowerMessage.includes('inventory') || lowerMessage.includes('asset') || lowerMessage.includes('stock')) {
      return `📦 **Inventory Management**

I can help you:
• Track stock levels and predict shortages
• Optimize reorder points and quantities
• Analyze asset utilization patterns
• Generate automated reports

*Real-time AI optimization coming with OpenAI integration.*`
    }
  }
  
  if (currentPage === 'call-centre') {
    if (lowerMessage.includes('call') || lowerMessage.includes('customer') || lowerMessage.includes('service')) {
      return `📞 **Call Center Analytics**

Available features:
• Customer satisfaction trend analysis
• Agent performance optimization
• Call volume prediction and staffing
• Service quality improvements

*Enhanced AI insights available with full integration.*`
    }
  }
  
  if (currentPage === 'analytics') {
    return `📈 **Advanced Analytics**

I can provide:
• Cross-departmental performance insights
• Predictive modeling and forecasting
• Data visualization recommendations
• Custom report generation

*Full AI-powered analytics require OpenAI API configuration.*`
  }
  
  // General helpful responses
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('capabilities')) {
    return `🤖 **SIRTIS Copilot Capabilities**

I'm your AI assistant for:

**📊 Analytics & Insights**
• Performance predictions and trend analysis
• Data visualization and reporting
• KPI monitoring across all departments

**🧑‍💼 HR Management**
• Employee performance analysis
• Attendance and productivity tracking
• Skills development recommendations

**📋 Project Management**
• Timeline optimization and risk assessment
• Resource allocation suggestions
• Milestone tracking and reporting

**📦 Operations**
• Inventory optimization
• Process automation recommendations
• Quality control insights

**🔍 Current Status**
You're viewing: **${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}**

*For full AI capabilities including OpenAI-powered predictions and document analysis, contact your administrator.*

What would you like to explore?`
  }
  
  if (lowerMessage.includes('status') || lowerMessage.includes('system')) {
    return `⚡ **System Status**

**Current Page**: ${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
**AI Mode**: Demo (OpenAI integration pending)
**Features Active**: ✅ Context awareness, ✅ Page-specific help, ✅ Quick actions

**Available Now**:
• Contextual assistance based on your current page
• Navigation help and feature explanations
• Best practice recommendations
• Process guidance

**Coming with Full AI**:
• Predictive analytics and insights
• Document analysis and extraction
• Automated report generation
• Advanced decision support

How can I help you with ${currentPage} today?`
  }
  
  return `💬 **I understand you're asking about**: "${message}"

I'm here to help with SIRTIS operations! Based on your current page (**${currentPage}**), I can provide:

• Contextual guidance and best practices
• Feature explanations and navigation help
• Process recommendations
• Quick access to relevant tools

**🔧 For Advanced Features**: Contact your administrator to enable full AI integration with OpenAI for predictive analytics, document analysis, and automated insights.

What specific aspect of **${currentPage}** would you like help with?`
}
