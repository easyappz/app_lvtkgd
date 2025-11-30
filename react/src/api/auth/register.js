import { instance } from '../axios.js';

export const register = (data) => {
  return instance.post('/api/auth/register', data);
};
