import { supabase } from '../lib/supabaseClient';
import { Mission, Guardian } from '../types';

export interface UserMission {
    id: string;
    user_id: string;
    mission_id: string;
    status: 'pending' | 'completed';
    completed_at?: string;
}

export const missionService = {
    getAll: async (): Promise<Mission[]> => {
        const { data, error } = await supabase
            .from('missions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    getById: async (id: string): Promise<Mission | undefined> => {
        const { data, error } = await supabase
            .from('missions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return data;
    },

    save: async (mission: Omit<Mission, 'id' | 'created_at'>, id?: string): Promise<Mission> => {
        if (id) {
            const { data, error } = await supabase
                .from('missions')
                .update(mission)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('missions')
                .insert(mission)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('missions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Calculate ranking based on completed missions using a stored procedure or joining in client
    // For simplicity, we'll fetch completed missions and aggregate on client for now 
    // (ideal for MVP, move to SQL view for scale)
    getRanking: async (): Promise<Guardian[]> => {
        const { data: missions, error: mError } = await supabase
            .from('user_missions')
            .select('*, mission:missions(xp_reward), profile:profiles(id, full_name, email)')
            .eq('status', 'completed');

        if (mError) throw mError;
        if (!missions) return [];

        const rankingMap = new Map<string, any>();

        missions.forEach((um: any) => {
            if (!um.profile) return; // Skip if profile deleted

            const profileId = um.profile.id;
            const xp = um.mission?.xp_reward || 0;

            if (!rankingMap.has(profileId)) {
                rankingMap.set(profileId, {
                    id: profileId,
                    name: um.profile.full_name || 'Usuário',
                    // email: um.profile.email,
                    total_xp: 0,
                    completed_missions: 0,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${um.profile.full_name || 'User'}`
                });
            }

            const userStats = rankingMap.get(profileId)!;
            userStats.total_xp += xp;
            userStats.completed_missions += 1;
        });

        const sorted = Array.from(rankingMap.values())
            .sort((a, b) => b.total_xp - a.total_xp);

        return sorted.map((user, index) => ({
            id: user.id,
            rank: index + 1,
            name: user.name,
            xp: user.total_xp >= 1000 ? `${(user.total_xp / 1000).toFixed(1)}k` : `${user.total_xp}`,
            avatar: user.avatar
        }));
    },

    getUserMissions: async (userId: string): Promise<UserMission[]> => {
        const { data, error } = await supabase
            .from('user_missions')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data || [];
    },

    completeMission: async (missionId: string, userId: string): Promise<void> => {
        const { error } = await supabase
            .from('user_missions')
            .insert({
                user_id: userId,
                mission_id: missionId,
                status: 'completed',
                completed_at: new Date().toISOString()
            });

        if (error) {
            // Check if it's a unique constraint violation (already completed)
            if (error.code === '23505') return;
            throw error;
        }
    }
};
