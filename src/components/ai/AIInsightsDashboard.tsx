"use client";

import { useState, useEffect } from "react";
import { 
  ChartPieIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  LanguageIcon,
  TagIcon,
  ShieldCheckIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";

interface DocumentInsights {
  totalDocuments: number;
  analyzedDocuments: number;
  avgQualityScore: number;
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  sentimentDistribution: Record<string, number>;
  readabilityLevels: Record<string, number>;
  languageDistribution: Record<string, number>;
  topTopics: Array<{
    topic: string;
    count: number;
  }>;
  securityLevels: Record<string, number>;
  recommendations: Array<{
    type: string;
    message: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  timeframe: string;
}

interface AIInsightsDashboardProps {
  timeframe?: string;
  department?: string;
  includePersonal?: boolean;
}

export function AIInsightsDashboard({ 
  timeframe = "30", 
  department, 
  includePersonal = true 
}: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<DocumentInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [timeframe, department, includePersonal]);

  const loadInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        timeframe,
        includePersonal: includePersonal.toString()
      });
      
      if (department) {
        params.append("department", department);
      }

      const response = await fetch(`/api/documents/ai/insights?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load insights");
      }
    } catch (error) {
      console.error("Error loading insights:", error);
      setError("An error occurred while loading insights");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-500";
      case "negative": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-saywhat-purple border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading AI insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadInsights}
            className="mt-3 px-4 py-2 bg-saywhat-purple text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-saywhat-purple to-saywhat-orange rounded-lg">
            <ChartPieIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Document Insights</h3>
            <p className="text-sm text-gray-600">
              Analysis of {insights.totalDocuments} documents ({insights.timeframe})
            </p>
          </div>
        </div>
        <button
          onClick={loadInsights}
          className="px-3 py-2 text-saywhat-purple border border-saywhat-purple rounded-lg hover:bg-purple-50 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">
              {Math.round((insights.analyzedDocuments / insights.totalDocuments) * 100)}%
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{insights.analyzedDocuments}</div>
          <div className="text-sm text-gray-600">Analyzed Documents</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <SparklesIcon className="h-6 w-6 text-green-600" />
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{insights.avgQualityScore}</div>
          <div className="text-sm text-gray-600">Avg Quality Score</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TagIcon className="h-6 w-6 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">TOP</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{insights.topTopics.length}</div>
          <div className="text-sm text-gray-600">Unique Topics</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">
              {insights.recommendations.filter(r => r.priority === 'high').length} HIGH
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{insights.recommendations.length}</div>
          <div className="text-sm text-gray-600">Recommendations</div>
        </div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Categories */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-600" />
            Top Document Categories
          </h4>
          <div className="space-y-2">
            {insights.topCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-saywhat-purple opacity-${100 - index * 20}`}></div>
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{category.count}</div>
                  <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <ChartPieIcon className="h-5 w-5 text-gray-600" />
            Document Sentiment
          </h4>
          <div className="space-y-3">
            {Object.entries(insights.sentimentDistribution).map(([sentiment, count]) => (
              <div key={sentiment} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getSentimentColor(sentiment)}`}></div>
                  <span className="text-sm capitalize text-gray-700">{sentiment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900">{count}</div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getSentimentColor(sentiment)}`}
                      style={{ 
                        width: `${(count / insights.analyzedDocuments) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Topics */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-gray-600" />
          Most Common Topics
        </h4>
        <div className="flex flex-wrap gap-2">
          {insights.topTopics.slice(0, 12).map((topic, index) => (
            <span
              key={topic.topic}
              className="px-3 py-1 bg-saywhat-purple/10 text-saywhat-purple rounded-full text-sm font-medium flex items-center gap-1"
            >
              {topic.topic}
              <span className="text-xs bg-saywhat-purple/20 px-1.5 py-0.5 rounded-full">
                {topic.count}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-gray-600" />
            AI Recommendations
          </h4>
          <div className="space-y-3">
            {insights.recommendations.slice(0, 5).map((recommendation, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{recommendation.type}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{recommendation.message}</p>
                <div className="text-xs text-saywhat-purple font-medium">
                  Action: {recommendation.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {Object.keys(insights.languageDistribution).length}
          </div>
          <div className="text-xs text-gray-500">Languages</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {Object.keys(insights.readabilityLevels).length}
          </div>
          <div className="text-xs text-gray-500">Reading Levels</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {Object.keys(insights.securityLevels).length}
          </div>
          <div className="text-xs text-gray-500">Security Levels</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {insights.totalDocuments - insights.analyzedDocuments}
          </div>
          <div className="text-xs text-gray-500">Pending Analysis</div>
        </div>
      </div>
    </div>
  );
}
