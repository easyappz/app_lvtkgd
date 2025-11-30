import { instance } from '../axios.js';

export const getFriendsList = (username, page = 1, limit = 20) => {
  return instance.get(`/friends/${username}`, {
    params: { page, limit },
  });
};
