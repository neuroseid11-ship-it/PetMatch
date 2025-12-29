
import { ONG } from '../types';

const STORAGE_KEY = 'petmatch_ongs';

export const ongService = {
  getAll: (): ONG[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): ONG | undefined => {
    const ongs = ongService.getAll();
    return ongs.find(o => o.id === id);
  },

  save: (ong: Omit<ONG, 'id' | 'createdAt'>, id?: string): ONG => {
    const ongs = ongService.getAll();
    let savedONG: ONG;

    if (id) {
      const existing = ongs.find(o => o.id === id);
      savedONG = { ...ong, id, createdAt: existing?.createdAt || new Date().toISOString() };
      const updated = ongs.map(o => o.id === id ? savedONG : o);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      savedONG = { 
        ...ong, 
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString() 
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ongs, savedONG]));
    }
    return savedONG;
  },

  delete: (id: string): void => {
    const ongs = ongService.getAll();
    const filtered = ongs.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
