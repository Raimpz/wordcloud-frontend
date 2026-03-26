import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadProps {
    onUploadSuccess: (documentId: string) => void;
}

export default function FileUpload({onUploadSuccess}: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            if (selectedFile.size > 100 * 1024 * 1024) {
                setError("File size exceeds 100MB limit.");
                setFile(null);

                return;
            }

            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const { documentApi } = await import('../api/apiClient');
            const documentId = await documentApi.uploadFile(file);

            onUploadSuccess(documentId);
        } catch (err) {
            setError("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-100"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Upload Text File</h2>
                <p className="text-slate-500 mt-2">Select a .txt file up to 100MB to generate your word cloud.</p>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-10 hover:bg-slate-50 hover:border-blue-400 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input 
                    type="file" 
                    accept=".txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                <span className="text-sm font-medium text-slate-600">{file ? file.name : "Click or drag file to this area"}</span>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Process Document"}
            </button>
        </motion.div>
    );
}
