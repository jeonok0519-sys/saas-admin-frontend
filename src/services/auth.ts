import api from '../lib/api';
import type { User } from '../types';

export const authApi = {
  login: (data: { username: string; password: string }) => {
    return api.post('/auth/login', data) as Promise<{
      code: number;
      message: string;
      data: { token: string; userInfo: User };
    }>;
  },

  logout: () => {
    return api.post('/auth/logout') as Promise<{
      code: number;
      message: string;
    }>;
  },

  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    return api.post('/auth/change-password', data) as Promise<{
      code: number;
      message: string;
    }>;
  },

  getCurrentUser: () => {
    return api.get('/auth/me') as Promise<{
      code: number;
      message: string;
      data: User;
    }>;
  },
};