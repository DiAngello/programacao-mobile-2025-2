import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';

// --- TIPOS ---
export type User = {
  id: number;
  username: string;
  email: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

// --- FUNÇÕES ---

/**
 * Tenta fazer login no backend.
 */
export const login = async (email: string, password: string): Promise<User> => {
  console.log('AuthService: Tentando login com:', email);
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const { token, user } = response.data;

    if (!token) throw new Error('Token não recebido do backend');

    // Salva token e dados do usuário
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    console.log('AuthService: Login com sucesso, token salvo!');
    return user;

  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      console.error('AuthService: Falha no login (Backend):', error.response.data.error);
      throw new Error(error.response.data.error);
    }
    console.error('AuthService: Falha no login (Genérico):', error);
    throw new Error('Não foi possível conectar ao servidor.');
  }
};

/**
 * Tenta registrar um novo usuário no backend.
 */
export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Não foi possível conectar ao servidor.');
  }
};

/**
 * Faz logout limpando token e dados do usuário.
 */
export const logout = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userData');
  console.log('AuthService: Logout realizado.');
};

/**
 * Busca os dados do usuário logado (AsyncStorage).
 */
export const getProfileFromStorage = async (): Promise<User | null> => {
  const userDataString = await AsyncStorage.getItem('userData');
  if (userDataString) return JSON.parse(userDataString) as User;
  return null;
};

/**
 * Atualiza o perfil do usuário no backend.
 */
export const updateProfile = async (username: string, email: string, password?: string): Promise<User> => {
  try {
    const payload = { username, email, ...(password && { password }) };
    const response = await api.put<User>('/auth/me', payload);

    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    console.log('AuthService: Perfil atualizado com sucesso.');
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Não foi possível atualizar o perfil.');
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot_password', { email });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await api.post('/auth/resetPassword', { token, newPassword });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};