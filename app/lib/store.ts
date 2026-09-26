import { createClient } from '@supabase/supabase-js';

export interface Preset {
  id: string;
  name: string;
  description: string;
  price: number;
  beforeImg: string; // Will match before_img in DB
  afterImg: string;  // Will match after_img in DB
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const INITIAL_PRESETS: Preset[] = [
  {
    id: "preset_1",
    name: "Midnight Tokyo",
    description: "Transform your night shots with moody cinematic teals and vibrant neon oranges. Perfect for urban photography.",
    price: 1,
    beforeImg: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop",
    afterImg: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop&sat=150&con=150&bri=-10",
  },
  {
    id: "preset_2",
    name: "Vintage Film",
    description: "Give your portraits that timeless, nostalgic 35mm film aesthetic with soft highlights and grainy textures.",
    price: 1,
    beforeImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    afterImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop&sat=-30&con=80&hue=10",
  }
];

export async function getPresets(): Promise<Preset[]> {
  try {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching presets from Supabase:', error);
      return INITIAL_PRESETS;
    }

    if (!data || data.length === 0) {
      return INITIAL_PRESETS;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      beforeImg: item.before_img,
      afterImg: item.after_img
    }));
  } catch (err) {
    console.error('Supabase catch error:', err);
    return INITIAL_PRESETS;
  }
}

export async function addPreset(preset: Omit<Preset, 'id'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('presets')
      .insert([
        {
          name: preset.name,
          description: preset.description,
          price: preset.price,
          before_img: preset.beforeImg,
          after_img: preset.afterImg
        }
      ]);

    if (error) {
      console.error('Error uploading to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Upload catch error:', err);
    return false;
  }
}
