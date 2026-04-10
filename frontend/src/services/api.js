import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/users',
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
