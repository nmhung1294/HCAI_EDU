import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const queryVocabulary = async (query, customUrl = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/query`, {
      query: query,
      custom_url: customUrl
    });
    return response.data;
  } catch (error) {
    console.error('Error querying vocabulary:', error);
    throw error;
  }
}; 