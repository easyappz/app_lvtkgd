import { instance } from '../axios.js';

export const sendMessage = (chat_id, data) => {
  return instance.post(`/messages/chat/${chat_id}/send`, data);
};
