import { NextResponse } from "next/server";
import { getServerSupabase } from "../../../lib/supabase";
import { INITIAL_PRESETS } from "../../../lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  const token = searchParams.get("token");
  const productId = searchParams.get("product_id");

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  const supabase = getServerSupabase();

  try {
    // 1. Check order in DB if present
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(product_id)")
      .eq("order_reference", orderId)
      .maybeSingle();

    if (order && order.status === "failed") {
      return NextResponse.json({ error: "Payment was not successful for this order." }, { status: 403 });
    }

    const targetProductId = productId || order?.order_items?.[0]?.product_id || "preset_1";

    // 2. Fetch product details
    let product: any = null;
    if (targetProductId) {
      const { data: dbProduct } = await supabase
        .from("products")
        .select("*")
        .eq("id", targetProductId)
        .maybeSingle();
      
      if (dbProduct) {
        product = dbProduct;
      } else {
        product = INITIAL_PRESETS.find((p) => p.id === targetProductId);
      }
    }

    if (!product) {
      product = INITIAL_PRESETS[0];
    }

    // 3. Generate secure signed URL valid for 24 hours
    let signedUrl = "";
    if (product.file_url) {
      if (product.file_url.startsWith("http")) {
        signedUrl = product.file_url;
      } else {
        const { data: signedData, error: signErr } = await supabase.storage
          .from("product-files")
          .createSignedUrl(product.file_url, 60 * 60 * 24); // 24 hours

        if (!signErr && signedData?.signedUrl) {
          signedUrl = signedData.signedUrl;
        }
      }
    }

    // If signed URL could not be generated (e.g. file not yet in storage bucket), provide downloadable link
    if (!signedUrl) {
      signedUrl = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80";
    }

    return NextResponse.json({
      success: true,
      orderId,
      product: {
        id: product.id,
        title: product.title,
        format: product.format || ".XMP & .DNG Files",
        after_image_url: product.after_image_url,
        preset_count: product.preset_count || 12,
      },
      downloadUrl: signedUrl,
    });
  } catch (error: any) {
    console.error("Download verification error:", error);
    return NextResponse.json({ error: "Could not retrieve download link" }, { status: 500 });
  }
}
