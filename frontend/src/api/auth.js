import axios from './axiosClient';

export const authApi = {
  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await axios.post('/auth/logout');
    return response.data;
  },
  
  getMe: async () => {
    const response = await axios.get('/auth/check-auth');
    return response.data;
  }
};
