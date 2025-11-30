import { instance } from '../axios.js';

export const getMe = () => {
  return instance.get('/auth/me');
};
