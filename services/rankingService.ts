import { supabase } from '../lib/supabaseClient';

export interface UserRanking {
    id?: string;
    user_email: string;
    user_name: string;
    total_xp: number;
    total_coins: number;
    rank_position: number;
    missions_completed: number;
    level: number;
    updated_at?: string;
}

export class RankingService {
    // Calcular nível baseado em XP
    static getLevel(xp: number): number {
        if (xp < 100) return 1;
        if (xp < 300) return 2;
        if (xp < 600) return 3;
        if (xp < 1000) return 4;
        return 5;
    }

    // XP necessário para o próximo nível
    static getXPForNextLevel(currentXP: number): { current: number; next: number; remaining: number } {
        const levels = [0, 100, 300, 600, 1000];
        const currentLevel = this.getLevel(currentXP);

        if (currentLevel >= 5) {
            return { current: currentXP, next: 1000, remaining: 0 };
        }

        const nextLevelXP = levels[currentLevel];
        return {
            current: currentXP,
            next: nextLevelXP,
            remaining: nextLevelXP - currentXP
        };
    }

    // Recalcular ranking de todos os usuários baseado em missões completadas
    static async calculateRanking(): Promise<void> {
        try {
            // Buscar todas as missões do Supabase
            const { data: missions, error: missionsError } = await supabase
                .from('missions')
                .select('*');

            if (missionsError) throw missionsError;

            // Agrupar por usuário e calcular totais
            const userStats = new Map<string, { name: string; xp: number; coins: number; count: number }>();

            missions?.forEach((mission: any) => {
                if (mission.completed_by && Array.isArray(mission.completed_by)) {
                    mission.completed_by.forEach((completion: any) => {
                        const email = completion.user_email;
                        const name = completion.user_name;

                        if (!userStats.has(email)) {
                            userStats.set(email, { name, xp: 0, coins: 0, count: 0 });
                        }

                        const stats = userStats.get(email)!;
                        stats.xp += mission.xp || 0;
                        stats.coins += mission.coins || 0;
                        stats.count += 1;
                    });
                }
            });

            // Converter para array e ordenar por XP
            const rankings = Array.from(userStats.entries())
                .map(([email, stats]) => ({
                    user_email: email,
                    user_name: stats.name,
                    total_xp: stats.xp,
                    total_coins: stats.coins,
                    missions_completed: stats.count,
                    level: this.getLevel(stats.xp),
                    rank_position: 0
                }))
                .sort((a, b) => b.total_xp - a.total_xp)
                .map((user, index) => ({ ...user, rank_position: index + 1 }));

            // Limpar tabela antiga
            await supabase.from('user_rankings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // Inserir novos rankings
            if (rankings.length > 0) {
                const { error: insertError } = await supabase
                    .from('user_rankings')
                    .insert(rankings);

                if (insertError) throw insertError;
            }

            console.log(`Ranking recalculado: ${rankings.length} usuários`);
        } catch (error) {
            console.error('Erro ao calcular ranking:', error);
            throw error;
        }
    }

    // Obter ranking de um usuário específico
    static async getUserRanking(email: string): Promise<UserRanking | null> {
        try {
            const { data, error } = await supabase
                .from('user_rankings')
                .select('*')
                .eq('user_email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return data as UserRanking;
        } catch (error) {
            console.error('Erro ao buscar ranking do usuário:', error);
            return null;
        }
    }

    // Obter top N usuários do ranking
    static async getTopRanking(limit: number = 20): Promise<UserRanking[]> {
        try {
            const { data, error } = await supabase
                .from('user_rankings')
                .select('*')
                .order('rank_position', { ascending: true })
                .limit(limit);

            if (error) throw error;

            return (data as UserRanking[]) || [];
        } catch (error) {
            console.error('Erro ao buscar top ranking:', error);
            return [];
        }
    }

    // Obter todos os rankings
    static async getAll(): Promise<UserRanking[]> {
        try {
            const { data, error } = await supabase
                .from('user_rankings')
                .select('*')
                .order('rank_position', { ascending: true });

            if (error) throw error;

            return (data as UserRanking[]) || [];
        } catch (error) {
            console.error('Erro ao buscar rankings:', error);
            return [];
        }
    }

    // Atualizar XP e coins de um usuário (quando completa uma missão)
    static async updateUserXP(email: string, name: string, xpToAdd: number, coinsToAdd: number): Promise<void> {
        try {
            // Buscar ranking atual
            const current = await this.getUserRanking(email);

            if (current) {
                // Atualizar existente
                const newXP = current.total_xp + xpToAdd;
                const newCoins = current.total_coins + coinsToAdd;
                const newLevel = this.getLevel(newXP);
                const newMissionsCount = current.missions_completed + 1;

                await supabase
                    .from('user_rankings')
                    .update({
                        total_xp: newXP,
                        total_coins: newCoins,
                        level: newLevel,
                        missions_completed: newMissionsCount,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_email', email);
            } else {
                // Criar novo
                const newLevel = this.getLevel(xpToAdd);

                await supabase
                    .from('user_rankings')
                    .insert({
                        user_email: email,
                        user_name: name,
                        total_xp: xpToAdd,
                        total_coins: coinsToAdd,
                        level: newLevel,
                        missions_completed: 1,
                        rank_position: 999 // Será recalculado
                    });
            }

            // Recalcular posições de ranking
            await this.calculateRanking();
        } catch (error) {
            console.error('Erro ao atualizar XP do usuário:', error);
            throw error;
        }
    }

    // Obter estatísticas gerais do ranking
    static async getStats(): Promise<{
        totalUsers: number;
        averageXP: number;
        averageLevel: number;
        topXP: number;
    }> {
        try {
            const rankings = await this.getAll();

            if (rankings.length === 0) {
                return { totalUsers: 0, averageXP: 0, averageLevel: 0, topXP: 0 };
            }

            const totalXP = rankings.reduce((sum, r) => sum + r.total_xp, 0);
            const totalLevel = rankings.reduce((sum, r) => sum + r.level, 0);

            return {
                totalUsers: rankings.length,
                averageXP: Math.round(totalXP / rankings.length),
                averageLevel: Math.round(totalLevel / rankings.length),
                topXP: rankings[0]?.total_xp || 0
            };
        } catch (error) {
            console.error('Erro ao calcular estatísticas:', error);
            return { totalUsers: 0, averageXP: 0, averageLevel: 0, topXP: 0 };
        }
    }
}

export default RankingService;
