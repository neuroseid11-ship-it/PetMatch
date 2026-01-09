
import { ONG } from '../types';

import { supabase } from '../lib/supabaseClient';

export const ongService = {
  getAll: async (): Promise<ONG[]> => {
    const { data, error } = await supabase
      .from('ongs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ONGs:', error);
      return [];
    }

    return data.map(o => ({
      id: o.id,
      name: o.name,
      description: o.description,
      location: o.location,
      top: o.top_pos,
      left: o.left_pos,
      imageUrl: o.image_url,
      phone: o.phone,
      email: o.email,
      createdAt: o.created_at
    }));
  },

  getById: async (id: string): Promise<ONG | undefined> => {
    const { data, error } = await supabase
      .from('ongs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      location: data.location,
      top: data.top_pos,
      left: data.left_pos,
      imageUrl: data.image_url,
      phone: data.phone,
      email: data.email,
      createdAt: data.created_at
    };
  },

  save: async (ong: Omit<ONG, 'id' | 'createdAt'>, id?: string): Promise<ONG> => {
    const dbOng = {
      name: ong.name,
      description: ong.description,
      location: ong.location,
      top_pos: ong.top,
      left_pos: ong.left,
      image_url: ong.imageUrl,
      phone: ong.phone,
      email: ong.email
    };

    let result;
    if (id) {
      result = await supabase
        .from('ongs')
        .update(dbOng)
        .eq('id', id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('ongs')
        .insert(dbOng)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    const data = result.data;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      location: data.location,
      top: data.top_pos,
      left: data.left_pos,
      imageUrl: data.image_url,
      phone: data.phone,
      email: data.email,
      createdAt: data.created_at
    };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('ongs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
