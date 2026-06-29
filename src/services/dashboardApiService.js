import axiosClient from '@/axiosClient';

export const fetchDashboardData = () => axiosClient.get('/dashboard/dashboard');
