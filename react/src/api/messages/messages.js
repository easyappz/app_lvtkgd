import { instance } from '../axios.js';

export const getChatMessages = (chat_id, page = 1, limit = 50) => {
  return instance.get(`/api/messages/chat/${chat_id}/`, {
    params: { page, limit },
  });
};
