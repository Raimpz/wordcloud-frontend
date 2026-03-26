import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/documents',
});

export const documentApi = {
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/upload', formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });

        return response.data;
    },

    getStatistics: async (documentId: string) => {
        const response = await apiClient.get(`/${documentId}/statistics`);

        return response.data;
    }
};
