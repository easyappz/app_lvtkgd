import { instance } from '../axios.js';

export const getChats = (page = 1, limit = 20) => {
  return instance.get('/messages/chats', {
    params: { page, limit },
  });
};
