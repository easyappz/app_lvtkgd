import { instance } from '../axios.js';

export const toggleLike = (id) => {
  return instance.post(`/posts/${id}/like`);
};
