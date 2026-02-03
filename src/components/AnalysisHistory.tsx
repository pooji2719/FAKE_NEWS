import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, History, Loader2 } from 'lucide-react';
import { supabase, type NewsAnalysis } from '../lib/supabase';

export function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<NewsAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('news_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      setAnalyses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'fake':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'real':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'uncertain':
        return <HelpCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'fake':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'real':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'uncertain':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Recent Analyses</h2>
            <p className="text-gray-600 text-sm">View the latest fact-checking results</p>
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No analyses yet. Start by checking a news article above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getResultIcon(analysis.result)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getResultBadgeColor(
                        analysis.result
                      )}`}
                    >
                      {analysis.result.charAt(0).toUpperCase() + analysis.result.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {(analysis.confidence_score * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(analysis.created_at)}</span>
                </div>

                <p className="text-gray-700 mb-3 line-clamp-2">{analysis.article_text}</p>

                <details className="mt-3">
                  <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                    View reasoning
                  </summary>
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {analysis.reasoning}
                  </p>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
