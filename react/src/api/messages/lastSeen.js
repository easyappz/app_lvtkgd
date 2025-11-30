import { instance } from '../axios.js';

export const updateLastSeen = (id) => {
  return instance.put(`/member/${id}/last_seen`);
};
