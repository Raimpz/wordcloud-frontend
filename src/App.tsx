import { useState } from 'react';
import FileUpload from './components/FileUpload';
import StatisticsPanel from './components/StatisticsPanel';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

function App() {
  const [activeDocumentId, setActiveDocumentId] = useState<string>('');
  const [showNextView, setShowNextView] = useState(false);
  const [lookupId, setLookupId] = useState<string>('');
  const [isSubmited, setIsSubmited] = useState(false);

  const handleProcessStart = (): boolean => {
    setShowNextView(true);

    return true;
  };

  const handleUploadSuccess = (documentId: string) => {
    setActiveDocumentId(documentId);
  };

  const handleReset = () => {
    setActiveDocumentId('');
    setShowNextView(false);
    setIsSubmited(false);
  };

  const handleLookupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (lookupId.trim() !== activeDocumentId) return;

    setLookupId('');
    setIsSubmited(true);
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-blue-200">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <FileText className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-xl font-bold tracking-tight">WordCloud</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {!showNextView ? (
          <div className="space-y-8">
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onProcessStart={handleProcessStart}
              />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Document ID:</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">TODO show status</p>
                <p className="text-sm text-slate-500 font-mono mt-1">{activeDocumentId}</p>
              </div>
              <button onClick={handleReset} className="text-sm font-medium text-blue-600 hover:underline">
                Upload Another
              </button>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
              <form onSubmit={handleLookupSubmit} className="flex flex-1 gap-4">
                <input
                  type="text"
                  id="submit-document-id"
                  disabled={isSubmited === true}
                  placeholder={isSubmited === true ? activeDocumentId : 'Paste Document ID to see the word tree...'}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isSubmited === true || lookupId.trim() !== activeDocumentId || lookupId.trim() === ''}
                  className="px-6 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmited === true ? 'Submitted' : 'Show unique words'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center text-slate-400">
                Word Cloud Visualization Area
              </div>
                <StatisticsPanel documentId={activeDocumentId} isSubmitted={isSubmited} />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;
