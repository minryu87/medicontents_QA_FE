import axios from 'axios';
import { config } from '@/lib/config';

const databaseApi = axios.create({
  baseURL: `${config.apiUrl}/api/v1/admin/database`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
databaseApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Database table operations
export const getTables = async () => {
  const response = await databaseApi.get('/tables');
  return response.data;
};

export const getTableSchema = async (tableName: string) => {
  const response = await databaseApi.get(`/tables/${tableName}/schema`);
  return response.data;
};

export const getTableData = async (
  tableName: string,
  params?: {
    page?: number;
    page_size?: number;
    filters?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }
) => {
  const response = await databaseApi.get(`/tables/${tableName}/data`, { params });
  return response.data;
};

export const createTableRow = async (tableName: string, data: any) => {
  const response = await databaseApi.post(`/tables/${tableName}/data`, data);
  return response.data;
};

export const updateTableRow = async (tableName: string, rowId: any, data: any) => {
  const response = await databaseApi.put(`/tables/${tableName}/data/${rowId}`, data);
  return response.data;
};

export const deleteTableRow = async (tableName: string, rowId: any) => {
  const response = await databaseApi.delete(`/tables/${tableName}/data/${rowId}`);
  return response.data;
};

export default databaseApi;
