import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { documentApi, getErrorMessage, type WordStat } from '../api/apiClient';
import { findCutoffIndex } from '../utils/binarySearch';
import { CLOUD_SYNC_DELAY_MS } from '../constants';
import toast from 'react-hot-toast';

interface UseWordStatsResult {
    wordStats: WordStat[];
    isStatsLoading: boolean;
    cloudWordStats: WordStat[];
    handleWordUpdate: (wordId: number, newWord: string) => Promise<void>;
    handleWordDelete: (wordId: number) => Promise<void>;
    handleFilterApply: (minCount: number) => void;
    resetStats: () => void;
}

function computeCloudWords(stats: WordStat[], minCount: number): WordStat[] {
    if (minCount <= 0) return stats;

    return stats.slice(0, findCutoffIndex(stats, minCount));
}

export function useWordStats(documentId: string, isSubmitted: boolean): UseWordStatsResult {
    const [wordStats, setWordStats] = useState<WordStat[]>([]);
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [cloudMinCount, setCloudMinCount] = useState<number>(0);
    const [cloudSnapshot, setCloudSnapshot] = useState<WordStat[]>([]);
    const documentIdRef = useRef(documentId);
    documentIdRef.current = documentId;

    useEffect(() => {
        if (!isSubmitted || !documentId) return;

        let cancelled = false;

        const fetchStats = async () => {
            setIsStatsLoading(true);

            try {
                const data = await documentApi.getStatistics(documentId);

                if (cancelled) return;

                if (data.length === 0) {
                    toast('No words found in the document.');
                    setWordStats([]);

                    return;
                }

                const sortedWordsByCount = [...data].sort((a, b) => b.count - a.count);

                setWordStats(sortedWordsByCount);
                setCloudSnapshot(sortedWordsByCount);
            } catch (error) {
                toast.error(getErrorMessage(error, 'Failed to fetch statistics.'));
            } finally {
                if (!cancelled) {
                    setIsStatsLoading(false);
                }
            }
        };

        fetchStats();

        return () => {
            cancelled = true;
        };
    }, [isSubmitted, documentId]);

    useEffect(() => {
        if (!wordStats.length) {
            setCloudSnapshot([]);

            return;
        }

        const timer = setTimeout(() => {
            setCloudSnapshot(wordStats);
        }, CLOUD_SYNC_DELAY_MS);

        return () => clearTimeout(timer);
    }, [wordStats]);

    const cloudWordStats = useMemo(() => {
        return computeCloudWords(cloudSnapshot, cloudMinCount);
    }, [cloudSnapshot, cloudMinCount]);

    const handleWordUpdate = useCallback(async (wordId: number, newWord: string) => {
        try {
            const updated = await documentApi.updateWord(documentIdRef.current, wordId, newWord);

            setWordStats(prev => {
                const next = prev.map(word => word.id === wordId ? { ...word, word: updated.word } : word);
                setCloudSnapshot(next);

                return next;
            });

            toast.success('Word updated.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to update word.'));
        }
    }, []);

    const handleWordDelete = useCallback(async (wordId: number) => {
        try {
            await documentApi.deleteWord(documentIdRef.current, wordId);

            setWordStats(prev => {
                const next = prev.filter(word => word.id !== wordId);
                setCloudSnapshot(next);

                return next;
            });

            toast.success('Word deleted.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete word.'));
        }
    }, []);

    const handleFilterApply = useCallback((minCount: number) => {
        setCloudMinCount(minCount);
        setCloudSnapshot(wordStats);
    }, [wordStats]);

    const resetStats = useCallback(() => {
        setWordStats([]);
        setIsStatsLoading(false);
        setCloudMinCount(0);
        setCloudSnapshot([]);
    }, []);

    return {
        wordStats,
        isStatsLoading,
        cloudWordStats,
        handleWordUpdate,
        handleWordDelete,
        handleFilterApply,
        resetStats,
    };
}
