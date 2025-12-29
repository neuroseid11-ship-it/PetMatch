
import { AdoptionRequest } from '../types';

const STORAGE_KEY = 'petmatch_messages';

export const messageService = {
  getAll: (): AdoptionRequest[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  send: (request: Omit<AdoptionRequest, 'id' | 'createdAt' | 'status'>): AdoptionRequest => {
    const messages = messageService.getAll();
    const newMessage: AdoptionRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newMessage, ...messages]));
    return newMessage;
  },

  updateStatus: (id: string, status: AdoptionRequest['status']): void => {
    const messages = messageService.getAll();
    const updated = messages.map(m => m.id === id ? { ...m, status } : m);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete: (id: string): void => {
    const messages = messageService.getAll();
    const filtered = messages.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
