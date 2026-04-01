import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import type { WordStat } from '../api/apiClient';
import { findCutoffIndex } from '../utils/binarySearch';
import { useDebounce } from '../hooks/useDebounce';
import { DEBOUNCE_DELAY_MS } from '../constants';
import WordItem from './WordItem';

interface StatisticsPanelProps {
    words: WordStat[];
    isLoading: boolean;
    onWordUpdate: (wordId: number, newWord: string) => Promise<void>;
    onWordDelete: (wordId: number) => Promise<void>;
    onFilterApply: (minCount: number) => void;
}

export default memo(function StatisticsPanel({ words, isLoading, onWordUpdate, onWordDelete, onFilterApply }: StatisticsPanelProps) {
    const [minCount, setMinCount] = useState<string>('');
    const [isInputChanged, setIsInputChanged] = useState(true);
    const debouncedMinCount = useDebounce(minCount, DEBOUNCE_DELAY_MS);
    const scrollRef = useRef<HTMLDivElement>(null);

    const filteredWords = useMemo(() => {
        const threshold = parseInt(debouncedMinCount, 10);

        if (isNaN(threshold) || threshold <= 0) return words;

        return words.slice(0, findCutoffIndex(words, threshold));
    }, [words, debouncedMinCount]);

    const virtualizer = useVirtualizer({
        count: filteredWords.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 44,
        overscan: 10,
    });

    const handleApplyFilter = useCallback(() => {
        const threshold = parseInt(minCount, 10);
        setIsInputChanged(true);

        onFilterApply(isNaN(threshold) || threshold <= 0 ? 0 : threshold);
    }, [minCount, onFilterApply]);

    const handleMinCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMinCount(event.target.value);
        setIsInputChanged(false);
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[700px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Word Frequencies</h3>
            </div>

            <div className="mb-3 flex gap-2">
                <input
                    type="number"
                    min="1"
                    placeholder="Minimum word count..."
                    name="mincount-change"
                    value={minCount ?? 1}
                    onChange={handleMinCountChange}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-slate-400"
                />
                <button
                    onClick={handleApplyFilter}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isInputChanged === true || !minCount || parseInt(minCount) < 1}
                >
                    Update
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                ) : (
                    <div
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {virtualizer.getVirtualItems().map(virtualRow => {
                            const item = filteredWords[virtualRow.index];

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <div className="flex items-center">
                                        <span className="text-xs font-medium text-slate-400 mr-1 mt-1 w-8 text-right shrink-0">
                                            {virtualRow.index + 1}.
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <WordItem
                                                item={item}
                                                onUpdate={onWordUpdate}
                                                onDelete={onWordDelete}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});
