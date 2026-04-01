import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { DocumentStatus } from '../api/apiClient';

interface StatusBadgeProps {
    status: DocumentStatus | null;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    if (!status) return null;

    switch (status.status) {
        case 'PENDING':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    <Loader2 className="w-3 h-3 animate-spin" /> Pending…
                </span>
            );
        case 'PROCESSING': {
            const progress = status.totalChunks > 0
                ? Math.round((status.processedChunks / status.totalChunks) * 100)
                : 0;
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <Loader2 className="w-3 h-3 animate-spin" /> In progress {progress}%
                </span>
            );
        }
        case 'COMPLETED':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
            );
        case 'ERROR':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" /> Error
                </span>
            );
        default:
            return null;
    }
}
