import { instance } from '../axios.js';

export const sendFriendRequest = (username, target_username) => {
  return instance.post(`/friends/${username}`, {
    target_username,
  });
};
