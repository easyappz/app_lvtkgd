import { instance } from '../axios.js';

export const updateProfile = (username, data) => {
  return instance.patch(`/api/profile/${username}/`, data);
};
