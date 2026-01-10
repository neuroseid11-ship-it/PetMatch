
import { UserPet } from '../types';
import { supabase } from '../lib/supabaseClient';

const fromDB = (row: any): UserPet => ({
  id: row.id,
  ownerEmail: row.owner_email,
  name: row.name,
  species: row.species,
  breed: row.breed,
  birthDate: row.birth_date,
  age: row.age,
  weight: row.weight,
  photoUrl: row.photo_url,
  vaccines: row.vaccines || [],
  healthEvents: row.health_events || [],
  diseases: row.diseases,
  surgeries: row.surgeries,
  medicines: row.medicines,
  consultations: row.consultations,
  grooming: row.grooming,
  chipNumber: row.chip_number
});

const toDB = (pet: Partial<UserPet>) => {
  const dbPet: any = { ...pet };
  if (pet.ownerEmail) dbPet.owner_email = pet.ownerEmail;
  if (pet.birthDate) dbPet.birth_date = pet.birthDate;
  if (pet.photoUrl) dbPet.photo_url = pet.photoUrl;
  if (pet.healthEvents) dbPet.health_events = pet.healthEvents;
  if (pet.chipNumber) dbPet.chip_number = pet.chipNumber;

  // Remove camelCase
  delete dbPet.ownerEmail;
  delete dbPet.birthDate;
  delete dbPet.photoUrl;
  delete dbPet.healthEvents;
  delete dbPet.chipNumber;

  return dbPet;
};

export const userPetService = {
  getByOwner: async (email: string): Promise<UserPet[]> => {
    if (!email) return [];

    const { data, error } = await supabase
      .from('user_pets')
      .select('*')
      .ilike('owner_email', email); // Case-insensitive match

    if (error) {
      console.error('Error fetching user pets:', error);
      return [];
    }
    return data.map(fromDB);
  },

  getAll: async (): Promise<UserPet[]> => {
    // Kept for compatibility if used elsewhere, though usually scoped by owner
    const { data, error } = await supabase.from('user_pets').select('*');
    if (error) return [];
    return data.map(fromDB);
  },

  save: async (pet: UserPet, id?: string): Promise<void> => {
    const dbPet = toDB(pet);

    if (id) {
      // Update
      delete dbPet.id; // Don't update ID into itself if present
      const { error } = await supabase
        .from('user_pets')
        .update(dbPet)
        .eq('id', id);
      if (error) {
        console.error('Error updating user pet:', error);
        throw error;
      }
    } else {
      // Insert
      const newId = Math.random().toString(36).substr(2, 9);
      dbPet.id = newId;
      const { error } = await supabase
        .from('user_pets')
        .insert(dbPet);
      if (error) {
        console.error('Error creating user pet:', error);
        throw error;
      }
    }
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('user_pets')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting user pet:', error);
  },

  deleteAll: async (): Promise<void> => {
    const { error } = await supabase
      .from('user_pets')
      .delete()
      .neq('id', '000000');

    if (error) {
      console.error('Error deleting all user pets:', error);
      throw error;
    }
  }
};
