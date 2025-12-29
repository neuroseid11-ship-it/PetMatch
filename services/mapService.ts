
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
      // Convert lat/lng back to percentage/top/left logic or handle in component
      // Ideally we should switch the frontend to use lat/lng. 
      // For now we will return raw lat/lng and handle display in the new component.
      lat: point.latitude,
      lng: point.longitude,
      // Keep legacy fields for compatibility if needed, but they won't be used by Leaflet
      top: '0%',
      left: '0%',
      imageUrl: point.image_url,
      isAlert: point.is_alert
    }));
  },

  save: async (point: any): Promise<any> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User must be logged in to add points');

    const dbPoint = {
      type: point.type,
      title: point.name,
      description: point.description,
      latitude: point.lat,
      longitude: point.lng,
      image_url: point.imageUrl,
      is_alert: point.isAlert || false,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('map_points')
      .insert(dbPoint)
      .select()
      .single();

    if (error) throw error;
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
