import { supabase } from './supabase';

export interface PresetProduct {
  id: string;
  title: string;
  slug?: string;
  description: string;
  full_description?: string;
  price: number;
  compare_at_price?: number | null;
  category?: string;
  tags?: string[];
  before_image_url?: string | null;
  after_image_url: string;
  gallery_images?: string[];
  preview_video_url?: string | null;
  format?: string;
  preset_count?: number;
  compatibility?: string[];
  includes?: string[];
  file_url?: string;
  is_published?: boolean;
  is_featured?: boolean;
  sales_count?: number;
  rating?: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const INITIAL_PRESETS: PresetProduct[] = [
  {
    id: "preset_1",
    title: "Midnight Tokyo",
    description: "Transform your night and urban shots with moody cinematic teals, deep blacks, and vibrant neon oranges.",
    full_description: "Midnight Tokyo is engineered specifically for low-light, street, and night photography. It selectively isolates cyan and amber hues while preserving realistic skin tones and adding subtle film grain for a distinct cinematic look.",
    price: 499,
    compare_at_price: 999,
    category: "Cinematic",
    tags: ["Lightroom", "Cinematic", "Night", "Urban", "Tokyo", "Street"],
    before_image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop",
    after_image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop&sat=160&con=140&bri=-10",
    format: ".XMP & .DNG Files",
    preset_count: 12,
    compatibility: ["Lightroom Desktop (v7.3+)", "Lightroom Mobile (iOS / Android)", "Photoshop Camera Raw (ACR)"],
    includes: ["12 Pro Night Presets (.XMP & .DNG)", "Detailed PDF Installation Guide", "Bonus Grain & Haze Toolkits", "Lifetime Free Updates"],
    is_published: true,
    is_featured: true,
    sales_count: 342,
    rating: 4.9,
    reviews_count: 48,
  },
  {
    id: "preset_2",
    title: "Vintage 35mm Film",
    description: "Give your portraits and travel imagery that timeless, nostalgic 35mm film aesthetic with warm highlights and soft textures.",
    full_description: "Inspired by legendary Kodak Portra and Fuji 400H stocks, this collection infuses your images with creamy skin tones, soft pastel highlights, organic shadow rolloff, and authentic film halation.",
    price: 399,
    compare_at_price: 799,
    category: "Film & Vintage",
    tags: ["Film", "Portra", "Vintage", "Portraits", "35mm", "Warm"],
    before_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    after_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop&sat=-20&con=70&hue=15",
    format: ".XMP & .DNG Files",
    preset_count: 15,
    compatibility: ["Lightroom Desktop (v7.3+)", "Lightroom Mobile (iOS / Android)", "Photoshop Camera Raw"],
    includes: ["15 Analog Film Presets (.XMP & .DNG)", "Dust & Grain Overlays", "Installation Guide & Video Tutorial", "Instant One-Click Install"],
    is_published: true,
    is_featured: true,
    sales_count: 512,
    rating: 5.0,
    reviews_count: 64,
  },
  {
    id: "preset_3",
    title: "Moody Nordic Forest",
    description: "Deep muted greens, atmospheric mist, and subtle earthy browns for landscape, adventure, and drone photography.",
    full_description: "Crafted for outdoor explorers and landscape photographers. Desaturates distracting greens while enriching deep forest undertones and boosting natural contrast without blowing out bright skies.",
    price: 449,
    compare_at_price: 899,
    category: "Landscape",
    tags: ["Landscape", "Moody", "Nordic", "Nature", "Forest", "Adventure"],
    before_image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
    after_image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop&sat=120&con=130&hue=-10",
    format: ".XMP & .DNG Files",
    preset_count: 10,
    compatibility: ["Lightroom Desktop (v7.3+)", "Lightroom Mobile", "Photoshop Camera Raw"],
    includes: ["10 Atmospheric Presets (.XMP & .DNG)", "Sky & Mist Enhancers", "Quick Start Guide"],
    is_published: true,
    is_featured: true,
    sales_count: 289,
    rating: 4.8,
    reviews_count: 31,
  },
  {
    id: "preset_4",
    title: "Editorial Editorial Portrait",
    description: "High-fashion, magazine-grade skin smoothing, balanced highlights, and clean modern tonality for studio and street portraits.",
    full_description: "Developed alongside commercial fashion and beauty photographers. Provides clean skin tones, crisp eye sharpening, and luxurious shadow depth.",
    price: 599,
    compare_at_price: 1199,
    category: "Portrait",
    tags: ["Portrait", "Editorial", "Studio", "Fashion", "Beauty", "Clean"],
    before_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop",
    after_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop&sat=110&con=120&bri=5",
    format: ".XMP & .DNG Files",
    preset_count: 14,
    compatibility: ["Lightroom Desktop", "Lightroom Mobile", "Photoshop ACR"],
    includes: ["14 Editorial Presets", "Skin Retouching Brushes", "Mobile & Desktop Instructions"],
    is_published: true,
    is_featured: false,
    sales_count: 198,
    rating: 4.9,
    reviews_count: 22,
  }
];

export async function getPublishedPresets(): Promise<PresetProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_PRESETS;
    }

    return data;
  } catch (err) {
    console.error('Error fetching presets:', err);
    return INITIAL_PRESETS;
  }
}
