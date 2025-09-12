import axios from 'axios';
import { config } from '@/lib/config';

const publicApi = axios.create({
  baseURL: `${config.apiUrl}/api/v1/public`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public statistics
export const getPublicStats = async () => {
  const response = await publicApi.get('/stats');
  return response.data;
};

export const getAgentPerformance = async () => {
  const response = await publicApi.get('/agent-performance');
  return response.data;
};

export const getCaseStudies = async () => {
  const response = await publicApi.get('/case-studies');
  return response.data;
};

// Public blog
export const getPublicPosts = async (params?: {
  page?: number;
  page_size?: number;
  category?: string;
  search?: string;
}) => {
  const response = await publicApi.get('/blog/posts', { params });
  return response.data;
};

export const getPublicPostDetail = async (postId: string) => {
  const response = await publicApi.get(`/blog/posts/${postId}`);
  return response.data;
};

export const getBlogCategories = async () => {
  const response = await publicApi.get('/blog/categories');
  return response.data;
};

export const getSamplePosts = async (limit: number = 12) => {
  const response = await publicApi.get('/blog/samples', { params: { limit } });
  return response.data;
};

export default publicApi;
