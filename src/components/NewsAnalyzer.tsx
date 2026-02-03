import { useState } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, Loader2, Newspaper } from 'lucide-react';

interface AnalysisResult {
  result: 'fake' | 'real' | 'uncertain';
  confidence: number;
  reasoning: string;
}

export function NewsAnalyzer() {
  const [articleText, setArticleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeArticle = async () => {
    if (articleText.trim().length < 50) {
      setError('Please enter at least 50 characters');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-news`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze article');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;

    switch (result.result) {
      case 'fake':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'real':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'uncertain':
        return <HelpCircle className="w-12 h-12 text-yellow-500" />;
    }
  };

  const getResultColor = () => {
    if (!result) return '';

    switch (result.result) {
      case 'fake':
        return 'from-red-500 to-red-600';
      case 'real':
        return 'from-green-500 to-green-600';
      case 'uncertain':
        return 'from-yellow-500 to-yellow-600';
    }
  };

  const getResultText = () => {
    if (!result) return '';

    switch (result.result) {
      case 'fake':
        return 'Likely Fake News';
      case 'real':
        return 'Likely Real News';
      case 'uncertain':
        return 'Uncertain';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analyze News Article</h2>
            <p className="text-gray-600 text-sm">Paste your article below for AI-powered verification</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="article" className="block text-sm font-medium text-gray-700 mb-2">
              Article Text
            </label>
            <textarea
              id="article"
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Paste the news article here (minimum 50 characters)..."
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              disabled={isAnalyzing}
            />
            <div className="mt-1 text-sm text-gray-500">
              {articleText.length} characters
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={analyzeArticle}
            disabled={isAnalyzing || articleText.trim().length < 50}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Article'
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-4 animate-fadeIn">
            <div className={`bg-gradient-to-r ${getResultColor()} p-6 rounded-xl text-white`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-full">
                  {getResultIcon()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{getResultText()}</h3>
                  <p className="text-white/90">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-2">Analysis Reasoning</h4>
              <p className="text-gray-700 leading-relaxed">{result.reasoning}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
