import { supabase } from '../lib/supabaseClient';

export interface Visit {
    id?: string;
    pet_id: string;
    pet_name: string;
    pet_image?: string;
    visitor_email: string;
    visitor_name: string;
    visitor_phone?: string;
    visit_date: string; // YYYY-MM-DD
    visit_time: string; // HH:MM
    address?: string;
    city?: string;
    state?: string;
    message?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at?: string;
    confirmed_at?: string;
    completed_at?: string;
}

export class VisitService {
    // Criar novo agendamento de visita
    static async scheduleVisit(visitData: Omit<Visit, 'id' | 'created_at'>): Promise<Visit | null> {
        try {
            const { data, error } = await supabase
                .from('visit_schedules')
                .insert([visitData])
                .select()
                .single();

            if (error) throw error;

            return data as Visit;
        } catch (error) {
            console.error('Erro ao agendar visita:', error);
            return null;
        }
    }

    // Listar todas as visitas
    static async getAll(): Promise<Visit[]> {
        try {
            const { data, error } = await supabase
                .from('visit_schedules')
                .select('*')
                .order('visit_date', { ascending: false });

            if (error) throw error;

            return (data as Visit[]) || [];
        } catch (error) {
            console.error('Erro ao buscar visitas:', error);
            return [];
        }
    }

    // Filtrar por status
    static async getByStatus(status: Visit['status']): Promise<Visit[]> {
        try {
            const { data, error } = await supabase
                .from('visit_schedules')
                .select('*')
                .eq('status', status)
                .order('visit_date', { ascending: false });

            if (error) throw error;

            return (data as Visit[]) || [];
        } catch (error) {
            console.error('Erro ao buscar visitas por status:', error);
            return [];
        }
    }

    // Visitas futuras (data >= hoje)
    static async getUpcoming(): Promise<Visit[]> {
        try {
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('visit_schedules')
                .select('*')
                .gte('visit_date', today)
                .in('status', ['pending', 'confirmed'])
                .order('visit_date', { ascending: true });

            if (error) throw error;

            return (data as Visit[]) || [];
        } catch (error) {
            console.error('Erro ao buscar visitas futuras:', error);
            return [];
        }
    }

    // Visitas passadas (data < hoje OU status completed/cancelled)
    static async getPast(): Promise<Visit[]> {
        try {
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('visit_schedules')
                .select('*')
                .or(`visit_date.lt.${today},status.in.(completed,cancelled)`)
                .order('visit_date', { ascending: false });

            if (error) throw error;

            return (data as Visit[]) || [];
        } catch (error) {
            console.error('Erro ao buscar visitas passadas:', error);
            return [];
        }
    }

    // Buscar visita por ID
    static async getById(id: string): Promise<Visit | null> {
        try {
            const { data, error } = await supabase
                .from('visit_schedules')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return data as Visit;
        } catch (error) {
            console.error('Erro ao buscar visita por ID:', error);
            return null;
        }
    }

    // Confirmar visita
    static async confirm(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('visit_schedules')
                .update({
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Erro ao confirmar visita:', error);
            return false;
        }
    }

    // Marcar como realizada
    static async complete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('visit_schedules')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Erro ao completar visita:', error);
            return false;
        }
    }

    // Cancelar visita
    static async cancel(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('visit_schedules')
                .update({
                    status: 'cancelled'
                })
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Erro ao cancelar visita:', error);
            return false;
        }
    }

    // Deletar visita
    static async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('visit_schedules')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Erro ao deletar visita:', error);
            return false;
        }
    }

    // Estatísticas de visitas
    static async getStats(): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        upcoming: number;
    }> {
        try {
            const all = await this.getAll();
            const upcoming = await this.getUpcoming();

            return {
                total: all.length,
                pending: all.filter(v => v.status === 'pending').length,
                confirmed: all.filter(v => v.status === 'confirmed').length,
                completed: all.filter(v => v.status === 'completed').length,
                cancelled: all.filter(v => v.status === 'cancelled').length,
                upcoming: upcoming.length
            };
        } catch (error) {
            console.error('Erro ao calcular estatísticas:', error);
            return {
                total: 0,
                pending: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0,
                upcoming: 0
            };
        }
    }

    // Filtrar por cidade
    static async getByCity(city: string): Promise<Visit[]> {
        try {
            const { data, error } = await supabase
                .from('visit_schedules')
                .select('*')
                .ilike('city', `%${city}%`)
                .order('visit_date', { ascending: false });

            if (error) throw error;

            return (data as Visit[]) || [];
        } catch (error) {
            console.error('Erro ao buscar visitas por cidade:', error);
            return [];
        }
    }

    // Filtrar por estado
    static async getByState(state: string): Promise<Visit[]> {
        try {
            const { data, error } = await supabase
                .from('visit_schedules')
                .select('*')
                .eq('state', state)
                .order('visit_date', { ascending: false });

            if (error) throw error;

            return (data as Visit[]) || [];
        } catch (error) {
            console.error('Erro ao buscar visitas por estado:', error);
            return [];
        }
    }
}

export default VisitService;
