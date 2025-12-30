
import { supabase } from '../lib/supabaseClient';
import { MapPoint } from '../types';

export const mapService = {
  getAll: async (): Promise<MapPoint[]> => {
    const { data, error } = await supabase
      .from('map_points')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching map points:', error);
      return [];
    }

    // Map Supabase fields to frontend MapPoint type
    return data.map(point => ({
      id: point.id,
      type: point.type,
      name: point.title,
      description: point.description,
      lat: point.latitude,
      lng: point.longitude,
      top: point.top_pos || '50%',
      left: point.left_pos || '50%',
      imageUrl: point.image_url,
      isAlert: point.is_alert
    }));
  },

  save: async (point: any): Promise<any> => {
    // If no user, maybe allow anonymous for now or require auth?
    // AdminDashboard usually requires auth.
    // We can try to get user, if not found, maybe just insert without user_id?
    const { data: { user } } = await supabase.auth.getUser();

    const dbPoint = {
      type: point.type,
      title: point.name,
      description: point.description,
      latitude: point.lat,
      longitude: point.lng,
      top_pos: point.top,
      left_pos: point.left,
      image_url: point.imageUrl,
      is_alert: point.isAlert || false,
      user_id: user?.id
    };

    const { data, error } = await supabase
      .from('map_points')
      .insert(dbPoint)
      .select()
      .single();

    if (error) {
      console.error('Error saving map point:', error);
      throw error;
    }
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('map_points')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
