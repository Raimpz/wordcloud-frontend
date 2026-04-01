import { memo, useMemo, useRef } from 'react';
import { ReactWordcloud } from '@cp949/react-wordcloud';
import { Loader2 } from 'lucide-react';
import type { WordStat } from '../api/apiClient';
import { MAX_CLOUD_WORDS } from '../constants';

interface CloudDatum {
    text: string;
    value: number;
    [key: string]: unknown;
}

interface WordCloudPanelProps {
    wordStats: WordStat[];
    isLoading: boolean;
    isSubmitted: boolean;
}

const CLOUD_OPTIONS = {
    fontSizes: [16, 58] as [number, number],
    enableTooltip: false,
    transitionDuration: 300,
    deterministic: true,
};

export default memo(function WordCloudPanel({ wordStats, isLoading, isSubmitted }: WordCloudPanelProps) {
    const cloudWordsRef = useRef<CloudDatum[]>([]);

    const cloudWords: CloudDatum[] = useMemo(() => {
        if (!wordStats.length) return [];

        const nextList = wordStats.slice(0, MAX_CLOUD_WORDS).map((word) => ({
            text: word.word,
            value: word.count,
        }));

        const previousList = cloudWordsRef.current;
        const sameLength = nextList.length === previousList.length;
        const sameContent = sameLength && nextList.every((word, index) =>
            word.text === previousList[index].text && word.value === previousList[index].value,
        );

        if (sameContent) {
            return cloudWordsRef.current;
        }

        cloudWordsRef.current = nextList;

        return nextList;
    }, [wordStats]);

    const hasWords = cloudWords.length > 0;

    return (
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 h-[700px] flex flex-col">
            <p className="text-xs text-slate-500">*Showing up to {MAX_CLOUD_WORDS} most frequent words</p>
            {!hasWords && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    {isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    ) : (
                        <p className="text-sm text-slate-400">
                            {isSubmitted ? 'No words to display. Upload another file.' : 'Submit a document ID to generate the word cloud.'}
                        </p>
                    )}
                </div>
            )}
            {hasWords && (
                <div className="flex-1 min-h-[360px] w-full">
                    <ReactWordcloud
                        words={cloudWords}
                        maxWords={MAX_CLOUD_WORDS}
                        options={CLOUD_OPTIONS}
                    />
                </div>
            )}
        </div>
    );
});
