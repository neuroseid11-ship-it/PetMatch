import { supabase } from '../lib/supabaseClient';

export interface Mission {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    coin_reward: number;
    type: 'daily' | 'one_time';
    action_link?: string;
    icon?: string;
    created_at: string;
}

export interface UserMission {
    id: string;
    user_id: string;
    mission_id: string;
    status: 'pending' | 'completed';
    completed_at?: string;
}

export interface RankingUser {
    profile_id: string;
    full_name: string;
    email: string;
    total_xp: number;
    completed_missions: number;
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
    getRanking: async (): Promise<RankingUser[]> => {
        const { data: missions, error: mError } = await supabase
            .from('user_missions')
            .select('*, mission:missions(xp_reward), profile:profiles(id, full_name, email)')
            .eq('status', 'completed');

        if (mError) throw mError;
        if (!missions) return [];

        const rankingMap = new Map<string, RankingUser>();

        missions.forEach((um: any) => {
            if (!um.profile) return; // Skip if profile deleted

            const profileId = um.profile.id;
            const xp = um.mission?.xp_reward || 0;

            if (!rankingMap.has(profileId)) {
                rankingMap.set(profileId, {
                    profile_id: profileId,
                    full_name: um.profile.full_name || 'Usuário',
                    email: um.profile.email,
                    total_xp: 0,
                    completed_missions: 0
                });
            }

            const userStats = rankingMap.get(profileId)!;
            userStats.total_xp += xp;
            userStats.completed_missions += 1;
        });

        return Array.from(rankingMap.values())
            .sort((a, b) => b.total_xp - a.total_xp);
    }
};
