import { instance } from '../axios.js';

export const searchUsers = (q, page = 1, limit = 20) => {
  return instance.get('/api/friends/search/', {
    params: { q, page, limit },
  });
};
