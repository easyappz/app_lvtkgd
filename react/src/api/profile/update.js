import { instance } from '../axios.js';

export const updateProfile = (username, data) => {
  return instance.patch(`/profile/${username}`, data);
};
