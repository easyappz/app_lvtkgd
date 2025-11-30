import { instance } from '../axios.js';

export const getProfile = (username) => {
  return instance.get(`/api/profile/${username}/`);
};
