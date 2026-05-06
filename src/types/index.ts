export interface User {
  id: number;
  username: string;
  realName: string;
  role: 'SUPER_ADMIN' | 'OPERATOR';
}

export interface Tenant {
  id?: number;
  tenantName: string;
  tenantCode: string;
  status: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface Operator {
  id?: number;
  username: string;
  password?: string;
  realName: string;
  role: 'SUPER_ADMIN' | 'OPERATOR';
  status: number;
  createTime?: string;
  updateTime?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userInfo: User;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export interface Statistics {
  total: number;
  active: number;
}
