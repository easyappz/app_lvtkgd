import { instance } from '../axios.js';

export const acceptFriendRequest = (username, request_id) => {
  return instance.post(`/friends/${username}/accept/${request_id}`);
};
