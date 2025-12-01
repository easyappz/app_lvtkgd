import { instance } from '../axios.js';

export const getRequests = (username, page = 1, limit = 20) => {
  return instance.get(`/api/friends/${username}/requests/`, {
    params: { page, limit },
  });
};

export const rejectRequest = (username, requestId) => {
  return instance.delete(`/api/friends/${username}/requests/${requestId}/`);
};
