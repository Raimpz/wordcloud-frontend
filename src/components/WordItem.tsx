import { memo, useState, useRef, useEffect } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { WordStat } from '../api/apiClient';
import toast from 'react-hot-toast';

interface WordItemProps {
    item: WordStat;
    onUpdate: (wordId: number, newWord: string) => Promise<void>;
    onDelete: (wordId: number) => Promise<void>;
}

export default memo(function WordItem({ item, onUpdate, onDelete }: WordItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const startEditing = () => {
        setIsEditing(true);
        setEditValue(item.word);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditValue('');
    };

    const saveEdit = async () => {
        const trimmed = editValue.trim().toLowerCase();

        if (!trimmed || trimmed === item.word) {
            cancelEditing();

            return;
        }
        try {
            await onUpdate(item.id, trimmed);
        } catch {
            toast.error('Failed to save word.');
        } finally {
            cancelEditing();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            saveEdit();
        } else if (event.key === 'Escape') {
            cancelEditing();
        }
    };

    return (
        <div className="group flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors overflow-hidden">
            <div className="flex items-center min-w-0 flex-1">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="font-medium text-slate-700 bg-white border border-blue-300 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                    />
                ) : (
                    <span className="font-medium text-slate-700 truncate">{item.word}</span>
                )}
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
                {isEditing ? (
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={saveEdit}
                            className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Save edit"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={cancelEditing}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Cancel edit"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={startEditing}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit word"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete word"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">{item.count}</span>
            </div>
        </div>
    );
});
