import { instance } from '../axios.js';

export const updateLastSeen = (id) => {
  return instance.put(`/api/member/${id}/last_seen/`);
};
