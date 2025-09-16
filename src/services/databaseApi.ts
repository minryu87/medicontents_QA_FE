import axios from 'axios';
import { config } from '@/lib/config';
import type {
  AdminReview,
  ClientReview,
  WorkflowLog,
  UniversalImage,
  ContentVersion,
  Notification
} from '@/types/common';

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

// Specialized functions for new tables

// Admin Reviews
export const getAdminReviews = async (params?: {
  page?: number;
  page_size?: number;
  filters?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return getTableData('admin_reviews', params);
};

export const createAdminReview = async (data: Partial<AdminReview>) => {
  return createTableRow('admin_reviews', data);
};

export const updateAdminReview = async (id: number, data: Partial<AdminReview>) => {
  return updateTableRow('admin_reviews', id, data);
};

export const deleteAdminReview = async (id: number) => {
  return deleteTableRow('admin_reviews', id);
};

// Client Reviews
export const getClientReviews = async (params?: {
  page?: number;
  page_size?: number;
  filters?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return getTableData('client_reviews', params);
};

export const createClientReview = async (data: Partial<ClientReview>) => {
  return createTableRow('client_reviews', data);
};

export const updateClientReview = async (id: number, data: Partial<ClientReview>) => {
  return updateTableRow('client_reviews', id, data);
};

export const deleteClientReview = async (id: number) => {
  return deleteTableRow('client_reviews', id);
};

// Workflow Logs
export const getWorkflowLogs = async (params?: {
  page?: number;
  page_size?: number;
  filters?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return getTableData('workflow_logs', params);
};

export const createWorkflowLog = async (data: Partial<WorkflowLog>) => {
  return createTableRow('workflow_logs', data);
};

export const updateWorkflowLog = async (id: number, data: Partial<WorkflowLog>) => {
  return updateTableRow('workflow_logs', id, data);
};

export const deleteWorkflowLog = async (id: number) => {
  return deleteTableRow('workflow_logs', id);
};

// Universal Images
export const getUniversalImages = async (params?: {
  page?: number;
  page_size?: number;
  filters?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return getTableData('universal_images', params);
};

export const createUniversalImage = async (data: Partial<UniversalImage>) => {
  return createTableRow('universal_images', data);
};

export const updateUniversalImage = async (id: number, data: Partial<UniversalImage>) => {
  return updateTableRow('universal_images', id, data);
};

export const deleteUniversalImage = async (id: number) => {
  return deleteTableRow('universal_images', id);
};

// Content Versions
export const getContentVersions = async (params?: {
  page?: number;
  page_size?: number;
  filters?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return getTableData('content_versions', params);
};

export const createContentVersion = async (data: Partial<ContentVersion>) => {
  return createTableRow('content_versions', data);
};

export const updateContentVersion = async (id: number, data: Partial<ContentVersion>) => {
  return updateTableRow('content_versions', id, data);
};

export const deleteContentVersion = async (id: number) => {
  return deleteTableRow('content_versions', id);
};

// Notifications
export const getNotifications = async (params?: {
  page?: number;
  page_size?: number;
  filters?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return getTableData('notifications', params);
};

export const createNotification = async (data: Partial<Notification>) => {
  return createTableRow('notifications', data);
};

export const updateNotification = async (id: number, data: Partial<Notification>) => {
  return updateTableRow('notifications', id, data);
};

export const deleteNotification = async (id: number) => {
  return deleteTableRow('notifications', id);
};

// Table statistics helpers
export const getTableStats = async (tableName: string) => {
  try {
    const schema = await getTableSchema(tableName);
    const data = await getTableData(tableName, { page_size: 1 });
    return {
      table_name: tableName,
      schema,
      total_rows: data.total || 0,
      has_data: (data.total || 0) > 0
    };
  } catch (error) {
    return {
      table_name: tableName,
      error: error instanceof Error ? error.message : String(error),
      has_data: false
    };
  }
};

export default databaseApi;
