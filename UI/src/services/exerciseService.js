import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const checkAnswers = async (exerciseId, userId = null, answers) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/check_answers`, {
      exercise_id: exerciseId,
      user_id: userId,
      answers: answers
    });
    return response.data;
  } catch (error) {
    console.error('Error checking answers:', error);
    throw error;
  }
};

export const getExerciseHistory = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exercise_history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting exercise history:', error);
    throw error;
  }
}; 