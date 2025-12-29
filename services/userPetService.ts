
import { UserPet } from '../types';

const STORAGE_KEY = 'petmatch_user_pets';

export const userPetService = {
  getByOwner: (email: string): UserPet[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    let allPets: UserPet[] = [];
    try {
      allPets = data ? JSON.parse(data) : [];
      if (!Array.isArray(allPets)) allPets = [];
    } catch (e) {
      console.error('Error parsing pet data:', e);
      allPets = [];
    }
    return allPets.filter(p => p.ownerEmail === email);
  },

  save: (pet: Omit<UserPet, 'id'>, id?: string): UserPet => {
    const data = localStorage.getItem(STORAGE_KEY);

    let allPets: UserPet[] = [];
    try {
      allPets = data ? JSON.parse(data) : [];
      if (!Array.isArray(allPets)) allPets = [];
    } catch (e) {
      console.error('Error parsing pet data in save:', e);
      allPets = [];
    }
    let savedPet: UserPet;

    if (id) {
      savedPet = { ...pet, id };
      allPets = allPets.map(p => p.id === id ? savedPet : p);
    } else {
      savedPet = { ...pet, id: Math.random().toString(36).substr(2, 9) };
      allPets.push(savedPet);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPets));
    return savedPet;
  },

  delete: (id: string): void => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    let allPets: UserPet[] = [];
    try {
      allPets = JSON.parse(data);
      if (!Array.isArray(allPets)) return;
    } catch (e) {
      console.error('Error parsing pet data in delete:', e);
      return;
    }
    const filtered = allPets.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
