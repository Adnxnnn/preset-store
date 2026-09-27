import { NextResponse } from "next/server";
import { getServerSupabase } from "../../../lib/supabase";
import { INITIAL_PRESETS } from "../../../lib/store";

export async function GET() {
  const supabase = getServerSupabase();
  try {
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && dbProducts && dbProducts.length > 0) {
      return NextResponse.json({ success: true, products: dbProducts });
    }

    return NextResponse.json({ success: true, products: INITIAL_PRESETS });
  } catch (err: any) {
    console.error("GET admin products error:", err);
    return NextResponse.json({ success: true, products: INITIAL_PRESETS });
  }
}

export async function POST(req: Request) {
  const supabase = getServerSupabase();

  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      full_description,
      price,
      compare_at_price,
      category,
      tags,
      format,
      preset_count,
      before_image_url,
      after_image_url,
      preview_video_url,
      file_url,
      is_published,
      is_featured,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Preset title is required" }, { status: 400 });
    }

    const payload: any = {
      title: title.trim(),
      description: (description || "").trim(),
      full_description: (full_description || description || "").trim(),
      price: Number(price) || 0,
      compare_at_price: compare_at_price ? Number(compare_at_price) : null,
      category: category || "Cinematic",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
      format: format || ".XMP & .DNG Files",
      preset_count: Number(preset_count) || 12,
      before_image_url: before_image_url || null,
      after_image_url: after_image_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
      preview_video_url: preview_video_url || null,
      file_url: file_url || "presets/default.zip",
      is_published: is_published !== false,
      is_featured: !!is_featured,
      updated_at: new Date().toISOString(),
    };

    // Check if updating an existing record
    const isCustomPresetId = id && !id.startsWith("preset_");

    if (isCustomPresetId) {
      // Check if product exists in database
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (existing) {
        const { data: updated, error: updateErr } = await supabase
          .from("products")
          .update(payload)
          .eq("id", id)
          .select("*")
          .single();

        if (updateErr) {
          console.error("Update error:", updateErr);
          throw new Error(updateErr.message);
        }

        return NextResponse.json({ success: true, product: updated });
      }
    }

    // Insert new product record
    const { data: inserted, error: insertErr } = await supabase
      .from("products")
      .insert([payload])
      .select("*")
      .single();

    if (insertErr) {
      console.error("Insert error:", insertErr);
      throw new Error(insertErr.message);
    }

    return NextResponse.json({ success: true, product: inserted });

  } catch (err: any) {
    console.error("Admin products save exception:", err);
    return NextResponse.json({ error: err.message || "Failed to save preset product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const supabase = getServerSupabase();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete exception:", err);
    return NextResponse.json({ error: err.message || "Failed to delete preset" }, { status: 500 });
  }
}
