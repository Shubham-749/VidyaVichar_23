import axios from './axiosClient';

export const coursesApi = {
  // Get all courses
  getAllCourses: async () => {
    const response = await axios.get('/courses');
    return response.data;
  },
  
  // Get a single course by ID
  getCourseById: async (courseId) => {
    const response = await axios.get(`/courses/${courseId}`);
    return response.data;
  },
  
  // Create a new course (admin only)
  createCourse: async (courseData) => {
    const response = await axios.post('/courses', courseData);
    return response.data;
  },
  
  // Enroll user in a course (admin only)
  enrollUser: async (courseId, userId) => {
    const response = await axios.post('/courses/enroll', { courseId, userId });
    return response.data;
  }
};
