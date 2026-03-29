import { Loader2 } from 'lucide-react';
import type { WordStat } from '../api/apiClient';

interface StatisticsPanelProps {
    words: WordStat[];
    isLoading: boolean;
    error: string | null;
}

export default function StatisticsPanel({ words, isLoading, error }: StatisticsPanelProps) {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[700px]">
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
                                className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors overflow-hidden"
                            >
                                <div className="flex items-center">
                                    <span className="text-xs font-medium text-slate-400 mr-1 mt-1">{index + 1}.</span>
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
