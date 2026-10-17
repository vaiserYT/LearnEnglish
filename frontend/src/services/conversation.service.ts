import { api } from './api';
import type { Conversation, Message } from '@/types';

export const conversationService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/conversations');
    return response.data;
  },

  async getConversation(id: number): Promise<Conversation> {
    const response = await api.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },

  async createConversation(data: {
    title: string;
    topic?: string;
    exercise_type?: string;
  }): Promise<Conversation> {
    const response = await api.post<Conversation>('/conversations', data);
    return response.data;
  },

  async sendMessage(conversationId: number, content: string): Promise<{ message: Message }> {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  },

  async endConversation(conversationId: number): Promise<void> {
    await api.post(`/conversations/${conversationId}/end`);
  },
};
