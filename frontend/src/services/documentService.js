import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getDocuments = async () => {
  const response = await api.get('/documents', {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const extractDocumentText = async (documentId) => {
  const response = await api.post(`/documents/${documentId}/extract`, null, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const analyzeDocument = async (documentId) => {
  const response = await api.post(`/documents/${documentId}/analyze`, null, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const generateMAP = async (documentId) => {
  const response = await api.post(`/documents/${documentId}/generate-map`, null, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const generateRisk = async (documentId) => {
  const response = await api.post(`/documents/${documentId}/generate-risk`, null, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const uploadEvidence = async (documentId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/documents/${documentId}/upload-evidence`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const validateCompliance = async (documentId) => {
  const response = await api.post(`/documents/${documentId}/validate`, null, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
