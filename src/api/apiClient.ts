import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/documents',
});

export interface DocumentStatus {
    id: string;
    status: string;
    totalChunks: number;
    processedChunks: number;
}

export interface WordStat {
    id: number;
    word: string;
    count: number;
    documentId: string;
}

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (axios.isAxiosError(error) && typeof error.response?.data === 'string' && error.response.data.length > 0) {
        return error.response.data;
    }

    return fallbackMessage;
}

export const documentApi = {
    uploadFile: async (file: File, onProgress?: (percent: number) => void) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/upload', formData, {
            headers: {'Content-Type': 'multipart/form-data'},

            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            },
        });

        return response.data;
    },

    getStatus: async (documentId: string): Promise<DocumentStatus> => {
        const response = await apiClient.get(`/${documentId}/status`);

        return response.data;
    },

    getStatistics: async (documentId: string): Promise<WordStat[]> => {
        const response = await apiClient.get<WordStat[]>(`/${documentId}/statistics`);

        return response.data;
    },

    updateWord: async (docId: string, wordId: number, word: string): Promise<WordStat> => {
        const response = await apiClient.put<WordStat>(`/${docId}/words/${wordId}`, { word });

        return response.data;
    },

    deleteWord: async (docId: string, wordId: number): Promise<void> => {
        await apiClient.delete(`/${docId}/words/${wordId}`);
    },
};
