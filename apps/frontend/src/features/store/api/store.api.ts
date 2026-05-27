import { apiGet } from '@/shared/api/client';

export const fetchMyStore = () => apiGet('/stores/mine');

