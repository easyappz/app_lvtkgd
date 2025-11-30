import { instance } from '../axios.js';

export const logout = () => {
  return instance.post('/auth/logout');
};
