import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_URL,
});

// Automatically inject Authorization header if token exists in localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (credentials: any) => {
  const response = await api.post('/login', credentials);
  return response.data; // returns { token, user }
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/register', userData);
  return response.data; // returns user
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// Task endpoints
export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (task: any) => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const updateTask = async (id: string, task: any) => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: string) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export const uploadExcel = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAhpSettings = async () => {
  const response = await api.get('/ahp-settings');
  return response.data;
};

export const getPriority = async () => {
  const response = await api.get('/priority');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard-stats');
  return response.data;
};

