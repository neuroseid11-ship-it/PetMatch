
import { supabase } from '../lib/supabaseClient';
import { PlatformUser } from '../types';

export const profileService = {
    async getProfile(userId: string): Promise<PlatformUser | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('Error fetching profile:', error);
            return null;
        }

        // Adapt database columns to PlatformUser interface if needed
        // (Assuming column names match snake_case mapped to camelCase manually or automatically if types match)
        // For now, mapping manually to be safe
        return {
            id: data.id,
            name: data.full_name,
            email: data.email,
            documentNumber: data.document_number,
            phone: data.phone,
            photoUrl: data.photo_url,
            documentFileUrl: data.document_file_url,
            state: data.state,
            city: data.city,
            address: data.address,
            petPreference: data.pet_preference,
            residenceType: data.residence_type,
            temperamentPreference: data.temperament_preference,
            type: data.user_type as any,
            status: data.status as any,
            coins: data.coins,
            createdAt: data.created_at,
        };
    },

    async updateProfile(userId: string, profileData: Partial<PlatformUser>) {
        // Map camelCase to snake_case for DB
        const dbData = {
            full_name: profileData.name,
            document_number: profileData.documentNumber,
            phone: profileData.phone,
            photo_url: profileData.photoUrl,
            document_file_url: profileData.documentFileUrl,
            state: profileData.state,
            city: profileData.city,
            address: profileData.address,
            pet_preference: profileData.petPreference,
            residence_type: profileData.residenceType,
            temperament_preference: profileData.temperamentPreference,
            updated_at: new Date().toISOString()
        };

        // Remove undefined values
        Object.keys(dbData).forEach(key => (dbData as any)[key] === undefined && delete (dbData as any)[key]);

        const { error } = await supabase
            .from('profiles')
            .update(dbData)
            .eq('id', userId);

        if (error) throw error;
    },

    async createProfile(userId: string, email: string, name?: string) {
        const { error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: email,
                full_name: name || 'Novo Usuário',
                status: 'pending',
                user_type: 'volunteer',
                created_at: new Date().toISOString()
            });

        if (error) throw error;
    },

    async uploadImage(file: File, bucket: 'avatars' | 'documents' | 'pet-images', path: string): Promise<string> {
        const { error } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: true });

        if (error) throw error;

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    }
};
