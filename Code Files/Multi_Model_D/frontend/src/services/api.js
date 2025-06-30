// F:\MIT\Multi_Model_D\frontend\src\services\api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

const documentApi = {
  getAll: async () => {
    try {
      const response = await api.get('/documents/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch documents');
    }
  },
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload document');
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`/documents/${id}/delete/`);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete document');
    }
  },
};

const conversationApi = {
  getAll: async () => {
    try {
      const response = await api.get('/conversations/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch conversations');
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/conversations/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch conversation');
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('/conversations/create/', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create conversation');
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`/conversations/${id}/delete/`);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete conversation');
    }
  },
};

const queryApi = {
  query: async (data) => {
    try {
      const response = await api.post('/query/', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to process query');
    }
  },
};

export { documentApi, conversationApi, queryApi };