import { useMemo, useRef } from 'react';
import { ReactWordcloud } from '@cp949/react-wordcloud';
import { Loader2 } from 'lucide-react';
import type { WordStat } from '../api/apiClient';

interface CloudDatum {
    text: string;
    value: number;
    [key: string]: unknown;
}

interface WordCloudPanelProps {
    wordStats: WordStat[];
    isLoading: boolean;
}

const MAX_CLOUD_WORDS = 500;

export default function ({ wordStats, isLoading }: WordCloudPanelProps) {
    const cloudWords: CloudDatum[] = useMemo(() => {
        if (!wordStats.length) return [];

        return wordStats.slice(0, MAX_CLOUD_WORDS).map((word) => ({
            text: word.word,
            value: word.count,
        }));
    }, [wordStats]);

    const hasWords = cloudWords.length > 0;

    return (
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 h-[700px] flex flex-col">
            {!hasWords && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    {isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    ) : (
                        <p className="text-sm text-slate-400">
                            Submit a document ID to generate the word cloud.
                        </p>
                    )}
                </div>
            )}
            {hasWords && (
                <div className="flex-1 min-h-[360px] w-full">
                    <ReactWordcloud
                        words={cloudWords}
                        maxWords={MAX_CLOUD_WORDS}
                        options={{
                            fontSizes: [14, 45],
                            enableTooltip: false,
                        }}
                    />
                </div>
            )}
        </div>
    );
}
