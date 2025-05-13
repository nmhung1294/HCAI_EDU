import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const generatePracticeQuestions = async (vocabulary, type = 'fill_in_blank') => {
  try {
    const response = await axios.post(`${API_URL}/generate_practice`, {
      vocabulary,
      type
    });
    return response.data.questions;
  } catch (error) {
    console.error('Error generating practice questions:', error);
    throw error;
  }
};

export const generateStoryGapExercise = async (vocabulary) => {
  try {
    const response = await axios.post(`${API_URL}/generate_practice`, {
      vocabulary,
      type: 'story_gap'
    });
    return response.data.questions[0];
  } catch (error) {
    console.error('Error generating story gap exercise:', error);
    throw error;
  }
};

export const generateRandomQuestions = async (count = 5) => {
  try {
    const response = await axios.post(`${API_URL}/generate_random_questions`, {
      count
    });
    return response.data;
  } catch (error) {
    console.error('Error generating random questions:', error);
    throw error;
  }
}; 