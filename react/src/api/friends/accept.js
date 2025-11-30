import { instance } from '../axios.js';

export const acceptFriendRequest = (username, request_id) => {
  return instance.post(`/api/friends/${username}/accept/${request_id}/`);
};
