import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { documentApi, getErrorMessage } from '../api/apiClient';
import { MAX_FILE_SIZE_BYTES } from '../constants';
import toast from 'react-hot-toast';

interface FileUploadProps {
    onUploadSuccess: (documentId: string) => void;
    onProcessStart: () => boolean;
    onUploadProgress?: (percent: number) => void;
}

export default function FileUpload({ onUploadSuccess, onProcessStart, onUploadProgress }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];

            if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
                toast.error("File size exceeds 100MB limit.");
                setFile(null);

                return;
            }

            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        onProcessStart();
        setIsUploading(true);

        try {
            const documentId = await documentApi.uploadFile(file, (percent) => {
                onUploadProgress?.(percent);
            });

            onUploadSuccess(documentId);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to upload file. Please try again."));
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
