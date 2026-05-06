import api from '../lib/api';
import type { Tenant } from '../types';

export const tenantApi = {
  list: (params: { current?: number; size?: number; keyword?: string; status?: number }) => {
    return api.get('/tenants', { params }) as Promise<{
      code: number;
      message: string;
      data: { records: Tenant[]; total: number; size: number; current: number };
    }>;
  },

  getById: (id: number) => {
    return api.get(`/tenants/${id}`) as Promise<{
      code: number;
      message: string;
      data: Tenant;
    }>;
  },

  create: (data: Tenant) => {
    return api.post('/tenants', data) as Promise<{
      code: number;
      message: string;
    }>;
  },

  update: (id: number, data: Tenant) => {
    return api.put(`/tenants/${id}`, data) as Promise<{
      code: number;
      message: string;
    }>;
  },

  delete: (id: number) => {
    return api.delete(`/tenants/${id}`) as Promise<{
      code: number;
      message: string;
    }>;
  },

  updateStatus: (id: number, status: number) => {
    return api.put(`/tenants/${id}/status`, { status }) as Promise<{
      code: number;
      message: string;
    }>;
  },

  getStatistics: () => {
    return api.get('/tenants/statistics') as Promise<{
      code: number;
      message: string;
      data: { total: number; active: number };
    }>;
  },
};