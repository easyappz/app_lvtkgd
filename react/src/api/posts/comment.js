import { instance } from '../axios.js';

export const createComment = (id, data) => {
  return instance.post(`/api/posts/${id}/comment/`, data);
};
