import { instance } from '../axios.js';

export const sendFriendRequest = (username, target_username) => {
  return instance.post(`/api/friends/${username}/`, {
    target_username,
  });
};
