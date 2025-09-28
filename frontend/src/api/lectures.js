import axios from './axiosClient';

export const lecturesApi = {
  // Get all lectures for a course
  getLecturesByCourse: async (courseId) => {
    const response = await axios.get(`/lectures/${courseId}/lectures`);
    return response.data;
  },
  
  // Create a new lecture (admin/teacher only)
  createLecture: async (courseId, lectureData) => {
    const response = await axios.post(`/lectures/${courseId}/lectures`, lectureData);
    return response.data;
  },
  
  // Check if lecture is joinable
  checkJoinable: async (lectureId) => {
    const response = await axios.post(`/lectures/join/${lectureId}`);
    return response.data;
  }
};
