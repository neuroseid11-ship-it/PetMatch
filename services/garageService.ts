
import { GarageItem } from '../types';

const STORAGE_KEY = 'petmatch_garage_market';

const INITIAL_GARAGE: GarageItem[] = [
  {
    id: 'g1',
    name: 'Caminha Ortopédica G (Usada)',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1541591415222-36e8b5502219?auto=format&fit=crop&q=80&w=400',
    sellerEmail: 'ana@exemplo.com',
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'g2',
    name: 'Bebedouro Fonte 2L',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
    sellerEmail: 'joao@exemplo.com',
    status: 'approved',
    createdAt: new Date().toISOString()
  }
];

export const garageService = {
  getAll: (): GarageItem[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GARAGE));
      return INITIAL_GARAGE;
    }
    return JSON.parse(data);
  },

  getApproved: (): GarageItem[] => {
    return garageService.getAll().filter(item => item.status === 'approved');
  },

  getBySeller: (email: string): GarageItem[] => {
    return garageService.getAll().filter(item => item.sellerEmail === email);
  },

  updateStatus: (id: string, status: GarageItem['status']): void => {
    const items = garageService.getAll();
    const updated = items.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete: (id: string): void => {
    const items = garageService.getAll();
    const updated = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  save: (item: Omit<GarageItem, 'id' | 'createdAt' | 'sellerEmail' | 'status'>): GarageItem => {
    const items = garageService.getAll();
    const newItem: GarageItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      sellerEmail: localStorage.getItem('petmatch_user_email') || 'anonimo@petmatch.com.br',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...items];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  }
};
