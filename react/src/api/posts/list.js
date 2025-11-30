import { instance } from '../axios.js';

export const getPosts = (page = 1, limit = 20) => {
  return instance.get('/api/posts/', {
    params: { page, limit },
  });
};
