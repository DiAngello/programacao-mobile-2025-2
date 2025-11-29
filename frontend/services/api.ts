import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3001/api'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});


api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Token enviado no header:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default api;