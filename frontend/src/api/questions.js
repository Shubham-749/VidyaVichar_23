import axios from './axiosClient';

export const questionsApi = {
  // Get all questions for a lecture
  getQuestionsByLecture: async (lectureId) => {
    const response = await axios.get(`/${lectureId}/questions`);
    return response.data;
  },
  
  // Ask a new question
  askQuestion: async (lectureId, content) => {
    try {
      const response = await axios.post(`/${lectureId}/questions`, { content });
      return response.data;
    } catch (error) {
      console.error('Error in questionsApi.askQuestion:', error);
      throw error;
    }
  },
  
  // Update question status
  updateQuestionStatus: async (questionId, status) => {
    const response = await axios.patch(`/question/${questionId}`, { status });
    return response.data;
  },
  
  // Toggle question importance
  toggleImportant: async (questionId, isImportant) => {
    const endpoint = isImportant ? 
      `/question/important/${questionId}` : 
      `/question/unimportant/${questionId}`;
    const response = await axios.patch(endpoint);
    return response.data;
  }
};
