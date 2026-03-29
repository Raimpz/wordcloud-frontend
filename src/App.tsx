import { useState, useEffect, useRef } from 'react';
import FileUpload from './components/FileUpload';
import StatisticsPanel from './components/StatisticsPanel';
import { motion } from 'framer-motion';
import { FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { documentApi, type DocumentStatus } from './api/apiClient';

function App() {
  const [activeDocumentId, setActiveDocumentId] = useState<string>('');
  const [showNextView, setShowNextView] = useState(false);
  const [lookupId, setLookupId] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleProcessStart = (): boolean => {
    setShowNextView(true);
    setUploadProgress(0);

    return true;
  };

  const handleUploadSuccess = (documentId: string) => {
    setActiveDocumentId(documentId);
  };

  const handleUploadProgress = (percent: number) => {
    setUploadProgress(percent);
  };

  const handleReset = () => {
    clearPolling();

    setActiveDocumentId('');
    setShowNextView(false);
    setIsSubmitted(false);
    setDocumentStatus(null);
    setUploadProgress(0);
  };

  const handleLookupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (lookupId.trim() !== activeDocumentId) return;

    setLookupId('');
    setIsSubmitted(true);
  }

  useEffect(() => {
    if (!activeDocumentId) return;

    const pollStatus = async () => {
      try {
        const status = await documentApi.getStatus(activeDocumentId);
        setDocumentStatus(status);

        if (status.status === 'COMPLETED' || status.status === 'ERROR') {
          clearPolling();
        }
      } catch {
      }
    };

    pollStatus();
    pollingRef.current = setInterval(pollStatus, 2000);

    return () => {
      clearPolling();
    };
  }, [activeDocumentId]);

  const getStatusBadge = () => {
    if (!documentStatus) return null;

    switch (documentStatus.status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Loader2 className="w-3 h-3 animate-spin" /> Pending…
          </span>
        );
      case 'PROCESSING': {
        const progress = documentStatus.totalChunks > 0
          ? Math.round((documentStatus.processedChunks / documentStatus.totalChunks) * 100)
          : 0;
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Loader2 className="w-3 h-3 animate-spin" /> In progress {progress}%
          </span>
        );
      }
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3" /> Error
          </span>
        );
      default:
        return null;
    }
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
              onUploadProgress={handleUploadProgress}
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
                  {getStatusBadge()}
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
                  disabled={isSubmitted === true}
                  placeholder={isSubmitted === true ? activeDocumentId : 'Paste Document ID to see the word tree...'}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isSubmitted === true || lookupId.trim() !== activeDocumentId || lookupId.trim() === ''}
                  className="px-6 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitted === true ? 'Submitted' : 'Show unique words'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center text-slate-400">
                Word Cloud Visualization Area
              </div>
                <StatisticsPanel documentId={activeDocumentId} isSubmitted={isSubmitted} />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;
