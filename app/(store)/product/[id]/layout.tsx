import { Metadata } from "next";
import { supabase } from "../../../lib/supabase";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: product } = await supabase.from('products').select('title, description, after_image_url').eq('id', params.id).single();
  
  if (!product) return { title: "Product Not Found | Luma" };
  
  return {
    title: `${product.title} | Luma Presets`,
    description: product.description,
    openGraph: {
      images: [product.after_image_url || ''],
    }
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
