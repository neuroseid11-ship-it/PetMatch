
import { RegisteredPet } from '../types';
import { supabase } from '../lib/supabaseClient';

const fromDB = (row: any): RegisteredPet => ({
  id: row.id,
  ownerEmail: row.owner_email,
  name: row.name,
  type: row.type,
  breed: row.breed,
  location: row.location,
  city: row.city,
  neighborhood: row.neighborhood,
  images: row.images || [],
  personality: row.personality,
  personalityDesc: row.personality_desc,
  age: row.age,
  gender: row.gender,
  status: row.status,
  createdAt: row.created_at,
  story: row.story || [],
  health: row.health,
  adoptionType: row.adoption_type,
  responsibilityType: row.responsibility_type,
  shelter: row.shelter,
  ongId: row.ong_id,
  sponsorshipType: row.sponsorship_type,
  sponsorshipValue: row.sponsorship_value,
  sponsorshipItem: row.sponsorship_item,
  sponsorshipReason: row.sponsorship_reason,
  residenceSuitability: row.residence_suitability,
  energyLevel: row.energy_level,
  chipNumber: row.chip_number
});

const toDB = (pet: Partial<RegisteredPet>) => {
  const dbPet: any = { ...pet };
  if (pet.ownerEmail) dbPet.owner_email = pet.ownerEmail;
  if (pet.adoptionType) dbPet.adoption_type = pet.adoptionType;
  if (pet.id && !pet.id.match(/^[a-z0-9]{9}$/)) delete dbPet.id; // Only delete if NOT our generated ID format, or just keep it.
  // Actually, better logic: 
  // If we want to allow explicit ID setting (like in register), we should KEEP IT.
  // The 'delete dbPet.id' was preventing insert with ID.
  // We can just remove this line entirely, or only delete if it is undefined/null?
  // Simply removing the line is safest for 'register' which sends an ID.
  // But for 'update', we might send ID in body. Supabase update ignores ID in body if we use eq('id', ...). 
  // So it is safe to keep.
  // BUT wait, toDB is used by update too. 
  // Let's just remove the delete.
  if (pet.personalityDesc) dbPet.personality_desc = pet.personalityDesc;
  if (pet.responsibilityType) dbPet.responsibility_type = pet.responsibilityType;
  if (pet.ongId) dbPet.ong_id = pet.ongId;
  if (pet.sponsorshipType) dbPet.sponsorship_type = pet.sponsorshipType;
  if (pet.sponsorshipValue) dbPet.sponsorship_value = pet.sponsorshipValue;
  if (pet.sponsorshipItem) dbPet.sponsorship_item = pet.sponsorshipItem;
  if (pet.sponsorshipReason) dbPet.sponsorship_reason = pet.sponsorshipReason;
  if (pet.residenceSuitability) dbPet.residence_suitability = pet.residenceSuitability;
  if (pet.energyLevel) dbPet.energy_level = pet.energyLevel;
  if (pet.chipNumber) dbPet.chip_number = pet.chipNumber;
  if (pet.city) dbPet.city = pet.city;
  if (pet.neighborhood) dbPet.neighborhood = pet.neighborhood;

  // Remove camelCase keys
  delete dbPet.ownerEmail;
  delete dbPet.adoptionType;
  delete dbPet.personalityDesc;
  delete dbPet.responsibilityType;
  delete dbPet.ongId;
  delete dbPet.sponsorshipType;
  delete dbPet.sponsorshipValue;
  delete dbPet.sponsorshipItem;
  delete dbPet.sponsorshipReason;
  delete dbPet.residenceSuitability;
  delete dbPet.energyLevel;
  delete dbPet.chipNumber;
  delete dbPet.city;
  delete dbPet.neighborhood;
  delete dbPet.personalityIcon; // Not in DB schema

  return dbPet;
};

export const petService = {
  getAll: async (): Promise<RegisteredPet[]> => {
    const { data, error } = await supabase
      .from('registered_pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pets:', error);
      return [];
    }
    return data.map(fromDB);
  },

  getById: async (id: string): Promise<RegisteredPet | undefined> => {
    const { data, error } = await supabase
      .from('registered_pets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return fromDB(data);
  },

  register: async (pet: Omit<RegisteredPet, 'id'>): Promise<string> => {
    const id = Math.random().toString(36).substr(2, 9);
    const dbPet = toDB({
      ...pet,
      id,
      status: pet.status || 'pending'
    });

    const { error } = await supabase
      .from('registered_pets')
      .insert(dbPet);

    if (error) {
      console.error('Error registering pet:', error);
      throw error;
    }
    return id;
  },

  update: async (id: string, updatedData: Partial<RegisteredPet>): Promise<void> => {
    const dbData = toDB(updatedData);
    const { error } = await supabase
      .from('registered_pets')
      .update(dbData)
      .eq('id', id);

    if (error) console.error('Error updating pet:', error);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('registered_pets')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting pet:', error);
  },

  deleteAll: async (): Promise<void> => {
    // Fetch all IDs first to avoid mass delete if RLS blocks blanket delete
    // OR try deleting where id is not null (common pattern)
    const { error } = await supabase
      .from('registered_pets')
      .delete()
      .neq('id', '000000'); // Hack to delete all, assuming no ID is 000000. Better than iterating.

    if (error) {
      console.error('Error deleting all registered pets:', error);
      throw error;
    }
  }
};
