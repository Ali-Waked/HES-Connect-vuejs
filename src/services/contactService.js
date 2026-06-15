import axiosClient from '@/axiosClient';

export function submitContact(data) {
  return axiosClient.post('/contact-us', data);
}
