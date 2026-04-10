import axios from 'axios';

// Use deployed backend URL if in production, otherwise use exactly what Vite runs on localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/users';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUsers = async (params) => {
  const response = await api.get('/', { params });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};
