import api from '../lib/api';
import type { Operator } from '../types';

export const operatorApi = {
  list: (params: { current?: number; size?: number; keyword?: string }) => {
    return api.get('/operators', { params }) as Promise<{
      code: number;
      message: string;
      data: { records: Operator[]; total: number; size: number; current: number };
    }>;
  },

  getById: (id: number) => {
    return api.get(`/operators/${id}`) as Promise<{
      code: number;
      message: string;
      data: Operator;
    }>;
  },

  create: (data: Partial<Operator>) => {
    return api.post('/operators', data) as Promise<{
      code: number;
      message: string;
    }>;
  },

  update: (id: number, data: Partial<Operator>) => {
    return api.put(`/operators/${id}`, data) as Promise<{
      code: number;
      message: string;
    }>;
  },

  delete: (id: number) => {
    return api.delete(`/operators/${id}`) as Promise<{
      code: number;
      message: string;
    }>;
  },

  resetPassword: (id: number) => {
    return api.post(`/operators/${id}/reset-password`) as Promise<{
      code: number;
      message: string;
    }>;
  },
};