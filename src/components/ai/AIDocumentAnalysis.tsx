"use client";

import { useState } from "react";
import { 
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  LanguageIcon,
  TagIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

interface DocumentAnalysis {
  sentiment: {
    score: number;
    label: "positive" | "neutral" | "negative";
    confidence: number;
  };
  readability: {
    score: number;
    level: "elementary" | "middle" | "high" | "college" | "graduate";
    suggestions: string[];
  };
  quality: {
    score: number;
    issues: string[];
    strengths: string[];
  };
  keyPhrases: string[];
  summary: string;
  topics: string[];
  language: string;
  wordCount: number;
  estimatedReadingTime: number;
}

interface AIDocumentAnalysisProps {
  documentId: string;
  documentContent?: string;
  onAnalysisComplete?: (analysis: DocumentAnalysis) => void;
}

export function AIDocumentAnalysis({ 
  documentId, 
  documentContent, 
  onAnalysisComplete 
}: AIDocumentAnalysisProps) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async () => {
    if (!documentId && !documentContent) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/documents/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          documentId,
          content: documentContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        onAnalysisComplete?.(data.analysis);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to analyze document");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setError("An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case "positive": return "text-green-600 bg-green-100";
      case "negative": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-saywhat-purple to-saywhat-orange rounded-lg">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Document Analysis</h3>
            <p className="text-sm text-gray-600">Comprehensive AI-powered document insights</p>
          </div>
        </div>
        
        <button
          onClick={analyzeDocument}
          disabled={isAnalyzing || (!documentId && !documentContent)}
          className="px-4 py-2 bg-saywhat-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Analyzing...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              Analyze Document
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(analysis.sentiment.label)}`}>
                  {analysis.sentiment.label}
                </span>
              </div>
              <div className="text-sm text-gray-600">Sentiment</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(analysis.sentiment.confidence * 100)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <AcademicCapIcon className="h-5 w-5 text-gray-500" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReadabilityColor(analysis.readability.score)}`}>
                  {analysis.readability.level}
                </span>
              </div>
              <div className="text-sm text-gray-600">Readability</div>
              <div className="text-lg font-semibold text-gray-900">
                {analysis.readability.score}/100
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <StarIcon className="h-5 w-5 text-gray-500" />
                <ChartBarIcon className={`h-4 w-4 ${getQualityColor(analysis.quality.score)}`} />
              </div>
              <div className="text-sm text-gray-600">Quality Score</div>
              <div className="text-lg font-semibold text-gray-900">
                {analysis.quality.score}/100
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <LanguageIcon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-sm text-gray-600">Reading Time</div>
              <div className="text-lg font-semibold text-gray-900">
                {analysis.estimatedReadingTime} min
              </div>
            </div>
          </div>

          {/* Document Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              AI Summary
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topics & Key Phrases */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-gray-600" />
                Topics & Key Phrases
              </h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Main Topics</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-saywhat-purple/10 text-saywhat-purple rounded-full text-xs font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Phrases</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyPhrases.slice(0, 8).map((phrase, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Assessment */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                Quality Assessment
              </h4>
              <div className="space-y-3">
                {analysis.quality.strengths.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-2">Strengths</h5>
                    <ul className="space-y-1">
                      {analysis.quality.strengths.slice(0, 3).map((strength, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.quality.issues.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-red-700 mb-2">Areas for Improvement</h5>
                    <ul className="space-y-1">
                      {analysis.quality.issues.slice(0, 3).map((issue, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Readability Suggestions */}
          {analysis.readability.suggestions.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <AcademicCapIcon className="h-5 w-5 text-yellow-600" />
                Readability Suggestions
              </h4>
              <ul className="space-y-1">
                {analysis.readability.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Document Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{analysis.wordCount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Words</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{analysis.language}</div>
              <div className="text-xs text-gray-500">Language</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{analysis.topics.length}</div>
              <div className="text-xs text-gray-500">Topics</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{analysis.keyPhrases.length}</div>
              <div className="text-xs text-gray-500">Key Phrases</div>
            </div>
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && !error && (
        <div className="text-center py-8 text-gray-500">
          <SparklesIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Click "Analyze Document" to get AI-powered insights about this document.</p>
          <p className="text-sm mt-1">Analyze sentiment, readability, quality, and extract key topics.</p>
        </div>
      )}
    </div>
  );
}
