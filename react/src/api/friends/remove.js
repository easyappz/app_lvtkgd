import { instance } from '../axios.js';

export const removeFriend = (username, friend_username) => {
  return instance.delete(`/friends/${username}/${friend_username}`);
};
