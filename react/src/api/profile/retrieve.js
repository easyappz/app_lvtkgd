import { instance } from '../axios.js';

export const getProfile = (username) => {
  return instance.get(`/profile/${username}`);
};
