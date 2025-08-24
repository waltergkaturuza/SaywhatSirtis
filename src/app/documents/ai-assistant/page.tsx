"use client";

import { useState, useRef, useEffect } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import {
  SparklesIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  TagIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  documents?: any[];
  suggestions?: string[];
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your SAYWHAT AI Document Assistant. I can help you find documents, analyze content, extract insights, and answer questions about your document repository. What would you like to know?',
      timestamp: new Date(),
      suggestions: [
        'Find all financial reports from Q4 2024',
        'Summarize the latest HR policies',
        'What are the key points in our data protection policy?',
        'Show me documents related to training materials'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('find') || lowerQuery.includes('search')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I found several documents related to your search. Here are the most relevant results:`,
        timestamp: new Date(),
        documents: [
          {
            id: '1',
            title: 'Q4 2024 Financial Report',
            description: 'Comprehensive quarterly financial analysis',
            type: 'PDF',
            size: '2.4 MB',
            uploadDate: '2024-12-01',
            category: 'Financial',
            classification: 'CONFIDENTIAL'
          },
          {
            id: '2',
            title: 'Annual Budget Analysis',
            description: 'Detailed budget breakdown and projections',
            type: 'Excel',
            size: '1.8 MB',
            uploadDate: '2024-11-15',
            category: 'Financial',
            classification: 'CONFIDENTIAL'
          }
        ],
        suggestions: [
          'Summarize these financial reports',
          'Compare Q4 with Q3 performance',
          'Show me budget variance analysis'
        ]
      };
    }

    if (lowerQuery.includes('summarize') || lowerQuery.includes('summary')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Here's a summary of the key points from the documents:

📊 **Financial Performance**: Revenue increased by 12% compared to the previous quarter, with strong growth in the services sector.

📈 **Budget Analysis**: Operating expenses remained within 5% of projected budget, showing good cost control.

🎯 **Key Metrics**: 
- Revenue: $2.4M (+12%)
- Operating Margin: 18.5% (+2.1%)
- Cash Flow: $450K (+8%)

⚠️ **Action Items**: Review marketing spend allocation and consider increasing R&D investment for Q1 2025.`,
        timestamp: new Date(),
        suggestions: [
          'Show me more details about revenue growth',
          'What are the main cost drivers?',
          'Generate an executive summary'
        ]
      };
    }

    if (lowerQuery.includes('policy') || lowerQuery.includes('policies')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I found relevant policy documents. Here are the key highlights:

🔒 **Data Protection Policy**: Updated compliance with international standards, includes GDPR requirements and data handling procedures.

👥 **HR Policies**: Recent updates to remote work guidelines, performance evaluation processes, and leave policies.

🛡️ **Security Policies**: Enhanced cybersecurity measures, access controls, and incident response procedures.

📋 **Compliance**: All policies are current and aligned with regulatory requirements.`,
        timestamp: new Date(),
        documents: [
          {
            id: '3',
            title: 'Data Protection Policy v2.1',
            description: 'Updated privacy and data handling guidelines',
            type: 'PDF',
            size: '856 KB',
            uploadDate: '2024-10-15',
            category: 'Legal',
            classification: 'PUBLIC'
          }
        ],
        suggestions: [
          'What changed in the latest policy update?',
          'Show me compliance requirements',
          'Find training materials for these policies'
        ]
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I understand you're asking about "${query}". I can help you with:

🔍 **Document Search**: Find specific documents using keywords, dates, or categories
📄 **Content Analysis**: Summarize documents and extract key insights  
📊 **Data Extraction**: Pull specific information from reports and spreadsheets
🤖 **Smart Recommendations**: Suggest related documents and content
📈 **Trend Analysis**: Identify patterns in your document usage and content

What specific task would you like me to help you with?`,
      timestamp: new Date(),
      suggestions: [
        'Find documents from last month',
        'Analyze document usage trends',
        'Help me organize my files',
        'Extract data from spreadsheets'
      ]
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <ModulePage
      metadata={{
        title: "AI Document Assistant",
        description: "Intelligent document analysis and search powered by AI",
        breadcrumbs: [
          { name: "Document Repository", href: "/documents" },
          { name: "AI Assistant" }
        ]
      }}
    >
      <div className="max-w-full mx-auto px-4 h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">AI Document Assistant</h1>
                <p className="text-purple-100">Ask questions, find documents, and get insights from your repository</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-white">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">1,247 docs indexed</span>
              </div>
              <div className="flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">AI-powered search</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-4xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-saywhat-orange text-white' 
                        : 'bg-purple-600 text-white'
                    }`}>
                      {message.type === 'user' ? (
                        <UserIcon className="h-5 w-5" />
                      ) : (
                        <SparklesIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`rounded-lg p-4 ${
                        message.type === 'user' 
                          ? 'bg-saywhat-orange text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>

                      {/* Documents Results */}
                      {message.documents && message.documents.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {message.documents.map((doc, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <DocumentIcon className="h-5 w-5 text-saywhat-orange mt-1" />
                                  <div>
                                    <h4 className="font-medium text-gray-900">{doc.title}</h4>
                                    <p className="text-sm text-gray-600">{doc.description}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                      <span>{doc.type} • {doc.size}</span>
                                      <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        doc.classification === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                                        doc.classification === 'CONFIDENTIAL' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {doc.classification}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                  </button>
                                  <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <ShareIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Try asking:</p>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <LightBulbIcon className="h-3 w-3 mr-1" />
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about documents, search for files, or request analysis..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <SparklesIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span>Send</span>
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button 
                onClick={() => handleSuggestionClick('Find recent documents')}
                className="inline-flex items-center px-3 py-1 text-sm text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100"
              >
                <ClockIcon className="h-3 w-3 mr-1" />
                Recent Files
              </button>
              <button 
                onClick={() => handleSuggestionClick('Analyze document trends')}
                className="inline-flex items-center px-3 py-1 text-sm text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100"
              >
                <ChartBarIcon className="h-3 w-3 mr-1" />
                Analyze Trends
              </button>
              <button 
                onClick={() => handleSuggestionClick('Help me organize documents')}
                className="inline-flex items-center px-3 py-1 text-sm text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100"
              >
                <FolderIcon className="h-3 w-3 mr-1" />
                Organize Files
              </button>
              <button 
                onClick={() => handleSuggestionClick('Extract data from reports')}
                className="inline-flex items-center px-3 py-1 text-sm text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100"
              >
                <DocumentTextIcon className="h-3 w-3 mr-1" />
                Extract Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
