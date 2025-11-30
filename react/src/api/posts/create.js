import { instance } from '../axios.js';

export const createPost = (data) => {
  return instance.post('/posts/', data);
};
