import { instance } from '../axios.js';

export const toggleLike = (id) => {
  return instance.post(`/api/posts/${id}/like/`);
};
