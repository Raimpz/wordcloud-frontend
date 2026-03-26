import { useState } from 'react';
import FileUpload from './components/FileUpload';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

function App() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const handleUploadSuccess = (documentId: string) => {
    setActiveDocumentId(documentId);
  };

  const handleReset = () => {
    setActiveDocumentId(null);
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
        {!activeDocumentId ? (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Processing Document</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">ID: {activeDocumentId}</p>
              </div>
              <button onClick={handleReset} className="text-sm font-medium text-blue-600 hover:underline">Upload Another</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center text-slate-400">
                Word Cloud Visualization Area
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center text-slate-400">
                Statistics Table Area
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;
