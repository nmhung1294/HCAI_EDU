import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const queryIELTSVocabulary = async (query, customUrl = null) => {
  try {
    const response = await axios.post(`${API_URL}/query`, { 
      query,
      custom_url: customUrl 
    });
    return response.data;
  } catch (error) {
    console.error('Error querying:', error);
    throw error;
  }
};