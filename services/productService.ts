import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('store_items')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.image_url,
      stock: item.stock
    }));
  },

  getById: async (id: string): Promise<Product | undefined> => {
    const { data, error } = await supabase
      .from('store_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.image_url,
      stock: data.stock
    };
  },

  save: async (product: Omit<Product, 'id'>, id?: string): Promise<Product> => {
    const dbProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.imageUrl,
      stock: product.stock
    };

    if (id) {
      const { data, error } = await supabase
        .from('store_items')
        .update(dbProduct)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.image_url,
        stock: data.stock
      };
    } else {
      const { data, error } = await supabase
        .from('store_items')
        .insert(dbProduct)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.image_url,
        stock: data.stock
      };
    }
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('store_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
