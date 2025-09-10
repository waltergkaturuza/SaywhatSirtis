"use client";

import { useState, useEffect } from "react";
import { 
  SparklesIcon,
  DocumentPlusIcon,
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  PresentationChartLineIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

interface ContentTemplate {
  name: string;
  description: string;
  prompts: string[];
}

interface GeneratedContent {
  title: string;
  content: string;
  summary: string;
  metadata: {
    wordCount: number;
    estimatedReadingTime: number;
    contentType: string;
  };
}

interface AIContentGeneratorProps {
  onContentGenerated?: (content: GeneratedContent) => void;
}

export function AIContentGenerator({ onContentGenerated }: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("summary");
  const [options, setOptions] = useState({
    length: "medium",
    tone: "professional",
    includeReferences: false,
    templateBased: true,
    accessLevel: "PRIVATE"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [templates, setTemplates] = useState<Record<string, ContentTemplate>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/documents/ai/generate");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || {});
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/documents/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          contentType,
          options,
          context: {
            department: "General",
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
        onContentGenerated?.(data.content);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setError("An error occurred during content generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const useTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  const contentTypeIcons = {
    summary: DocumentTextIcon,
    report: PresentationChartLineIcon,
    memo: BookOpenIcon,
    email: EnvelopeIcon,
    policy: ShieldCheckIcon,
    procedure: ArrowPathIcon,
    manual: BookOpenIcon,
    presentation: PresentationChartLineIcon,
    meeting_notes: DocumentTextIcon
  };

  const ContentTypeIcon = contentTypeIcons[contentType as keyof typeof contentTypeIcons] || DocumentTextIcon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-saywhat-purple to-saywhat-orange rounded-lg">
          <DocumentPlusIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Content Generator</h3>
          <p className="text-sm text-gray-600">Create professional documents using AI assistance</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Content Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(templates).map(([type, template]) => {
            const Icon = contentTypeIcons[type as keyof typeof contentTypeIcons] || DocumentTextIcon;
            return (
              <button
                key={type}
                onClick={() => setContentType(type)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  contentType === type
                    ? "border-saywhat-purple bg-purple-50 text-saywhat-purple"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-xs font-medium">{template.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Prompts */}
      {templates[contentType] && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Start Templates</label>
          <div className="space-y-2">
            {templates[contentType].prompts.slice(0, 3).map((templatePrompt, index) => (
              <button
                key={index}
                onClick={() => useTemplate(templatePrompt)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700 transition-colors"
              >
                {templatePrompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Prompt */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe what you want to create. For example: "Create a ${templates[contentType]?.name.toLowerCase() || 'document'} about..."`}
          rows={4}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saywhat-purple focus:border-transparent placeholder-gray-500 text-sm"
        />
      </div>

      {/* Advanced Options */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          Advanced Options
          <span className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Length</label>
                <select
                  value={options.length}
                  onChange={(e) => setOptions({ ...options, length: e.target.value })}
                  className="block w-full px-2 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="short">Short (200-400 words)</option>
                  <option value="medium">Medium (400-800 words)</option>
                  <option value="long">Long (800+ words)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tone</label>
                <select
                  value={options.tone}
                  onChange={(e) => setOptions({ ...options, tone: e.target.value })}
                  className="block w-full px-2 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Access Level</label>
                <select
                  value={options.accessLevel}
                  onChange={(e) => setOptions({ ...options, accessLevel: e.target.value })}
                  className="block w-full px-2 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="DEPARTMENT">Department</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={options.includeReferences}
                  onChange={(e) => setOptions({ ...options, includeReferences: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                Include References
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={options.templateBased}
                  onChange={(e) => setOptions({ ...options, templateBased: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                Use Template Format
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={generateContent}
          disabled={isGenerating || !prompt.trim()}
          className="w-full px-4 py-3 bg-saywhat-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Generating Content...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              Generate Content
            </>
          )}
        </button>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              Generated Content
            </h4>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{generatedContent.metadata.wordCount} words</span>
              <span>•</span>
              <span>{generatedContent.metadata.estimatedReadingTime} min read</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">{generatedContent.title}</h5>
            <p className="text-sm text-gray-600 mb-3">{generatedContent.summary}</p>
            
            <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {generatedContent.content}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => setGeneratedContent(null)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedContent.content);
                // You could add a toast notification here
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Copy Content
            </button>
            <button
              onClick={() => {
                // This would integrate with your document creation flow
                console.log("Save as document:", generatedContent);
              }}
              className="px-4 py-2 bg-saywhat-purple text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
            >
              <DocumentPlusIcon className="h-4 w-4" />
              Save as Document
            </button>
          </div>
        </div>
      )}

      {!generatedContent && !isGenerating && (
        <div className="text-center py-8 text-gray-500">
          <ContentTypeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Describe what you want to create and click "Generate Content".</p>
          <p className="text-sm mt-1">AI will help you create professional documents instantly.</p>
        </div>
      )}
    </div>
  );
}
