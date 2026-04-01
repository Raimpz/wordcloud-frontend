import { useCallback, useEffect, useRef, useState } from 'react';
import { documentApi, type DocumentStatus } from '../api/apiClient';
import { POLLING_INTERVAL_MS } from '../constants';

interface UseDocumentPollingResult {
    documentStatus: DocumentStatus | null;
    resetPolling: () => void;
}

export function useDocumentPolling(documentId: string): UseDocumentPollingResult {
    const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);

            pollingRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!documentId) return;

        const pollStatus = async () => {
            try {
                const status = await documentApi.getStatus(documentId);
                setDocumentStatus(status);

                if (status.status === 'COMPLETED' || status.status === 'ERROR') {
                    clearPolling();
                }
            } catch (error) {
                console.warn('Polling failed for document', documentId, error);
            }
        };

        pollStatus();

        pollingRef.current = setInterval(pollStatus, POLLING_INTERVAL_MS);

        return () => {
            clearPolling();
        };
    }, [documentId, clearPolling]);

    const resetPolling = useCallback(() => {
        clearPolling();
        setDocumentStatus(null);
    }, [clearPolling]);

    return { documentStatus, resetPolling };
}
