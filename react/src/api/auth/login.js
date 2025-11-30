import { instance } from '../axios.js';

export const login = (data) => {
  return instance.post('/auth/login', data);
};
