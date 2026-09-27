import { Metadata } from "next";
import { supabase } from "../../../lib/supabase";
import { INITIAL_PRESETS } from "../../../lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  let product: any = null;
  const { data } = await supabase
    .from("products")
    .select("title, description, after_image_url")
    .eq("id", id)
    .maybeSingle();

  if (data) {
    product = data;
  } else {
    product = INITIAL_PRESETS.find((p) => p.id === id);
  }

  if (!product) return { title: "Preset Pack Not Found | LUMA Presets" };

  return {
    title: `${product.title} | LUMA Presets`,
    description: product.description,
    openGraph: {
      title: `${product.title} - One-Click Lightroom Preset Pack`,
      description: product.description,
      images: [product.after_image_url || ""],
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
