"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { ModulePage } from "@/components/layout/enhanced-layout";
import { 
  SparklesIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  DocumentPlusIcon,
  ChartPieIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ArrowLeftIcon,
  HomeIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

// AI Components
import {
  AIDocumentSearch,
  AIDocumentAnalysis,
  AIContentGenerator,
  AIInsightsDashboard
} from "@/components/ai";

type AIFeature = "search" | "analysis" | "generator" | "insights" | "overview";

export default function AIDocumentFeatures() {
  const { data: session } = useSession();
  const [activeFeature, setActiveFeature] = useState<AIFeature>("overview");

  const features = [
    {
      id: "search" as AIFeature,
      name: "AI Search",
      description: "Intelligent document search using natural language",
      icon: MagnifyingGlassIcon,
      color: "bg-blue-500"
    },
    {
      id: "analysis" as AIFeature,
      name: "Document Analysis",
      description: "AI-powered sentiment, quality, and readability analysis",
      icon: DocumentTextIcon,
      color: "bg-green-500"
    },
    {
      id: "generator" as AIFeature,
      name: "Content Generator",
      description: "Create professional documents with AI assistance",
      icon: DocumentPlusIcon,
      color: "bg-purple-500"
    },
    {
      id: "insights" as AIFeature,
      name: "AI Insights",
      description: "Comprehensive analytics and recommendations",
      icon: ChartPieIcon,
      color: "bg-orange-500"
    }
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case "search":
        return <AIDocumentSearch />;
      case "analysis":
        return <AIDocumentAnalysis documentId="" />;
      case "generator":
        return <AIContentGenerator />;
      case "insights":
        return <AIInsightsDashboard />;
      default:
        return (
          <div className="space-y-8">
            {/* AI Overview */}
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-saywhat-purple to-saywhat-orange rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <SparklesIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                AI-Powered Document Repository
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Experience the future of document management with our comprehensive AI features. 
                Search intelligently, analyze content, generate documents, and gain insights automatically.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>OpenAI Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Smart Automation</span>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 ${feature.color} rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-saywhat-purple transition-colors">
                          {feature.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="mt-3 flex items-center text-saywhat-purple text-sm font-medium">
                          <span>Explore Feature</span>
                          <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Key Benefits */}
            <div className="bg-gradient-to-r from-saywhat-purple/5 to-saywhat-orange/5 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Key AI Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <LightBulbIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Intelligent Automation</h3>
                  <p className="text-sm text-gray-600">
                    Automate document classification, analysis, and content generation with advanced AI.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enhanced Discovery</h3>
                  <p className="text-sm text-gray-600">
                    Find documents faster with natural language search and intelligent recommendations.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <ChartPieIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Insights</h3>
                  <p className="text-sm text-gray-600">
                    Get actionable insights about document quality, sentiment, and usage patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-saywhat-purple rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Upload Documents</h4>
                    <p className="text-sm text-gray-600">Add your documents to the repository for AI processing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-saywhat-purple rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Enable AI Analysis</h4>
                    <p className="text-sm text-gray-600">Run comprehensive AI analysis to extract insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-saywhat-purple rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Explore Features</h4>
                    <p className="text-sm text-gray-600">Use AI search, content generation, and insights dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ModulePage
      metadata={{
        title: "AI Document Features",
        description: "Advanced AI-powered document management and analysis",
        breadcrumbs: [
          { name: "Documents", href: "/documents" },
          { name: "AI Features" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/documents"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="text-sm">Back to Documents</span>
            </Link>
            {activeFeature !== "overview" && (
              <button
                onClick={() => setActiveFeature("overview")}
                className="flex items-center gap-2 text-saywhat-purple hover:text-purple-700 transition-colors"
              >
                <HomeIcon className="h-4 w-4" />
                <span className="text-sm font-medium">AI Overview</span>
              </button>
            )}
          </div>
          
          {activeFeature !== "overview" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Current Feature:</span>
              <span className="text-sm font-medium text-gray-900">
                {features.find(f => f.id === activeFeature)?.name}
              </span>
            </div>
          )}
        </div>

        {/* Feature Tabs */}
        {activeFeature !== "overview" && (
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeFeature === feature.id
                      ? "bg-white text-saywhat-purple shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {feature.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Feature Content */}
        <div className="min-h-[600px]">
          {renderFeatureContent()}
        </div>
      </div>
    </ModulePage>
  );
}
