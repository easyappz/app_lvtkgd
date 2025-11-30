import { instance } from '../axios.js';

export const createComment = (id, data) => {
  return instance.post(`/posts/${id}/comment`, data);
};
