import { instance } from '../axios.js';

export const getPost = (id) => {
  return instance.get(`/api/posts/${id}`);
};
