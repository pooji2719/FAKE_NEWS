import { Shield } from 'lucide-react';
import { NewsAnalyzer } from './components/NewsAnalyzer';
import { AnalysisHistory } from './components/AnalysisHistory';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
            Fake News Detector
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered fact-checking to help you identify misinformation and verify news credibility
          </p>
        </header>

        <NewsAnalyzer />
        <AnalysisHistory />

        <footer className="text-center mt-16 pb-8">
          <p className="text-gray-500 text-sm">
            Powered by advanced Natural Language Processing
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
