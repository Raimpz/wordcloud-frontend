import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { documentApi } from '../api/apiClient';

interface WordCount {
    id: number;
    word: string;
    count: number;
}

interface StatisticsPanelProps {
    documentId: string;
    isSubmitted?: boolean;
}

export default function StatisticsPanel({ documentId, isSubmitted }: StatisticsPanelProps) {
    const [words, setWords] = useState<WordCount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await documentApi.getStatistics(documentId);

            if (data.length === 0) {
                setError("No words found in the document.");
                setWords([]);

                return;
            }

            const sortedData = data.sort((a: WordCount, b: WordCount) => b.count - a.count);

            setWords(sortedData);
        } catch (err) {
            setError("Failed to fetch statistics");
        } finally {
            setIsLoading(false);
        }
    }, [documentId]);

    useEffect(() => {
        if (isSubmitted === true) {
            fetchStatistics();
        }
    }, [isSubmitted]);

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Word Frequencies</h3>
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading && !error ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {words.map((item, index) => (
                            <li 
                                key={item.id} 
                                className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors"
                            >
                                <div className="flex items-center">
                                    <span className="w-6 text-xs font-medium text-slate-400">{index + 1}.</span>
                                    <span className="font-medium text-slate-700">{item.word}</span>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">{item.count}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
