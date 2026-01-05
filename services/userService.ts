import { supabase } from '../lib/supabaseClient';
import { PlatformUser } from '../types';

export const userService = {
  getAll: async (): Promise<PlatformUser[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, partner_profiles(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data.map(profile => ({
      id: profile.id,
      name: profile.full_name || profile.email?.split('@')[0] || 'Nome Indefinido',
      email: profile.email,
      type: profile.user_type || 'volunteer',
      documentNumber: profile.document_number || '',
      photoUrl: profile.photo_url || '',
      documentFileUrl: profile.document_file_url || '',
      status: profile.status || 'pending',
      createdAt: profile.created_at,
      coins: profile.coins || 0,
      state: profile.state,
      city: profile.city,
      address: profile.address,
      phone: profile.phone,
      petPreference: profile.pet_preference,
      residenceType: profile.residence_type,
      temperamentPreference: profile.temperament_preference,
      partnerProfile: profile.partner_profiles ? {
        id: profile.partner_profiles.id,
        name: profile.partner_profiles.company_name,
        about: profile.partner_profiles.about,
        bannerUrl: profile.partner_profiles.banner_url || '',
        logoUrl: profile.partner_profiles.logo_url || '',
        location: profile.partner_profiles.location || '',
        neighborhood: profile.partner_profiles.neighborhood || '',
        category: profile.partner_profiles.category,
        is24h: profile.partner_profiles.is_24h || false,
        phone: profile.partner_profiles.phone || '',
        email: profile.email, // Use profile email for contact
        instagram: profile.partner_profiles.instagram,
        promotions: profile.partner_profiles.promotions || [],
        top: '0', // Default for map, should be handled by map service eventually
        left: '0'
      } : undefined
    }));
  },

  listAllFromFirestore: async (): Promise<PlatformUser[]> => {
    return userService.getAll();
  },

  getById: async (id: string): Promise<PlatformUser | undefined> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, partner_profiles(*)')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.full_name || data.email?.split('@')[0] || 'Nome Indefinido',
      email: data.email,
      type: data.user_type || 'volunteer',
      documentNumber: data.document_number || '',
      photoUrl: data.photo_url || '',
      documentFileUrl: data.document_file_url || '',
      status: data.status || 'pending',
      createdAt: data.created_at,
      coins: data.coins || 0,
      state: data.state,
      city: data.city,
      address: data.address,
      phone: data.phone,
      petPreference: data.pet_preference,
      residenceType: data.residence_type,
      temperamentPreference: data.temperament_preference,
      partnerProfile: data.partner_profiles ? {
        id: data.partner_profiles.id,
        name: data.partner_profiles.company_name,
        about: data.partner_profiles.about,
        bannerUrl: data.partner_profiles.banner_url || '',
        logoUrl: data.partner_profiles.logo_url || '',
        location: data.partner_profiles.location || '',
        neighborhood: data.partner_profiles.neighborhood || '',
        category: data.partner_profiles.category,
        is24h: data.partner_profiles.is_24h || false,
        phone: data.partner_profiles.phone || '',
        email: data.email,
        instagram: data.partner_profiles.instagram,
        promotions: data.partner_profiles.promotions || [],
        top: '0',
        left: '0'
      } : undefined
    } as PlatformUser;
  },

  register: async (user: Omit<PlatformUser, 'id' | 'createdAt' | 'status' | 'coins'>): Promise<PlatformUser> => {
    // Note: Usually registration happens via Auth, not direct DB insert here.
    // But for admin dashboard usage if needed:
    const { data: profileData, error } = await supabase
      .from('profiles')
      .insert({
        email: user.email,
        full_name: user.name,
        user_type: user.type,
        document_number: user.documentNumber,
        status: 'pending',
        coins: 100
      })
      .select()
      .single();

    if (error) throw error;

    if (user.type === 'partner' && user.partnerProfile) {
      const { error: partnerError } = await supabase
        .from('partner_profiles')
        .insert({
          id: profileData.id,
          company_name: user.partnerProfile.name,
          about: user.partnerProfile.about,
          banner_url: user.partnerProfile.bannerUrl,
          logo_url: user.partnerProfile.logoUrl,
          location: user.partnerProfile.location,
          neighborhood: user.partnerProfile.neighborhood,
          category: user.partnerProfile.category,
          is_24h: user.partnerProfile.is24h,
          phone: user.partnerProfile.phone,
          instagram: user.partnerProfile.instagram,
          promotions: user.partnerProfile.promotions
        });

      if (partnerError) console.error("Error creating partner profile:", partnerError);
    }

    return {
      ...user,
      id: profileData.id,
      status: 'pending',
      coins: 100,
      createdAt: profileData.created_at
    } as PlatformUser;
  },

  update: async (id: string, updatedData: Partial<PlatformUser>): Promise<void> => {
    const dbUpdate: any = {};
    if (updatedData.name) dbUpdate.full_name = updatedData.name;
    if (updatedData.status) dbUpdate.status = updatedData.status;
    if (updatedData.coins !== undefined) dbUpdate.coins = updatedData.coins;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdate)
      .eq('id', id);

    if (error) throw error;

    if (updatedData.partnerProfile) {
      // Upsert partner profile
      const { error: partnerError } = await supabase
        .from('partner_profiles')
        .upsert({
          id: id,
          company_name: updatedData.partnerProfile.name,
          about: updatedData.partnerProfile.about,
          banner_url: updatedData.partnerProfile.bannerUrl,
          logo_url: updatedData.partnerProfile.logoUrl,
          location: updatedData.partnerProfile.location,
          neighborhood: updatedData.partnerProfile.neighborhood,
          category: updatedData.partnerProfile.category,
          is_24h: updatedData.partnerProfile.is24h,
          phone: updatedData.partnerProfile.phone,
          instagram: updatedData.partnerProfile.instagram,
          promotions: updatedData.partnerProfile.promotions || []
        });
      if (partnerError) throw partnerError;
    }
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
