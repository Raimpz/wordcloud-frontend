import { useState } from 'react';
import FileUpload from './components/FileUpload';
import StatisticsPanel from './components/StatisticsPanel';
import WordCloudPanel from './components/WordCloudPanel';
import StatusBadge from './components/StatusBadge';
import { motion } from 'framer-motion';
import { FileText, Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useDocumentPolling } from './hooks/useDocumentPolling';
import { useWordStats } from './hooks/useWordStats';

function App() {
  const [activeDocumentId, setActiveDocumentId] = useState('');
  const [showResultsView, setShowResultsView] = useState(false);
  const [documentIdInput, setDocumentIdInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {documentStatus, resetPolling } = useDocumentPolling(activeDocumentId);
  const {wordStats, isStatsLoading, cloudWordStats, handleWordUpdate, handleWordDelete, handleFilterApply, resetStats} = useWordStats(activeDocumentId, isSubmitted);

  const handleProcessStart = (): boolean => {
    setShowResultsView(true);
    setUploadProgress(0);
    return true;
  };

  const handleUploadSuccess = (documentId: string) => {
    setActiveDocumentId(documentId);
  };

  const handleReset = () => {
    resetPolling();
    resetStats();
    setActiveDocumentId('');
    setShowResultsView(false);
    setIsSubmitted(false);
    setUploadProgress(0);
  };

  const handleLookupSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (documentIdInput.trim() !== activeDocumentId) return;

    setDocumentIdInput('');
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-blue-200">
      <Toaster position="top-right" />
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <FileText className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-xl font-bold tracking-tight">WordCloud</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!showResultsView ? (
          <div className="space-y-8">
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onProcessStart={handleProcessStart}
              onUploadProgress={setUploadProgress}
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
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Document ID:</h3>
                  <StatusBadge status={documentStatus} />
                </div>
                {!activeDocumentId ? (
                  <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading… {uploadProgress > 0 ? `${uploadProgress}%` : ''}</span>
                  </div>
                ) : (
                  documentStatus?.status === 'COMPLETED'
                    ? <p className="text-sm text-slate-500 font-mono mt-1">{activeDocumentId}</p>
                    : <div className="h-3.5 w-75 bg-slate-200 rounded-full animate-pulse mt-2" />
                )}
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
                  disabled={isSubmitted}
                  placeholder={isSubmitted ? activeDocumentId : 'Paste Document ID to see the word tree...'}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  value={documentIdInput}
                  onChange={(e) => setDocumentIdInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isSubmitted || documentIdInput.trim() !== activeDocumentId || documentIdInput.trim() === ''}
                  className="px-6 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitted ? 'Submitted' : 'Show unique words'}
                </button>
              </form>
            </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <WordCloudPanel wordStats={cloudWordStats} isLoading={isStatsLoading} isSubmitted={isSubmitted} />
                </div>
                <StatisticsPanel words={wordStats} isLoading={isStatsLoading} onWordUpdate={handleWordUpdate} onWordDelete={handleWordDelete} onFilterApply={handleFilterApply} />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;
