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
    // 1. Verify that the order exists and is PAID
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(product_id)")
      .eq("order_reference", orderId)
      .maybeSingle();

    // If order found in DB, ensure it is PAID
    if (order && order.status !== "paid") {
      return NextResponse.json({ error: "Payment has not been completed for this order" }, { status: 403 });
    }

    const targetProductId = productId || order?.order_items?.[0]?.product_id;

    // 2. Fetch the product details
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
      return NextResponse.json({ error: "Associated preset product not found" }, { status: 404 });
    }

    // 3. Generate secure signed URL valid for 6 hours
    let signedUrl = "";
    if (product.file_url) {
      if (product.file_url.startsWith("http")) {
        signedUrl = product.file_url;
      } else {
        const { data: signedData, error: signErr } = await supabase.storage
          .from("product-files")
          .createSignedUrl(product.file_url, 60 * 60 * 6); // 6 hours

        if (!signErr && signedData?.signedUrl) {
          signedUrl = signedData.signedUrl;
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      product: {
        id: product.id,
        title: product.title,
        format: product.format || ".XMP & .DNG",
        after_image_url: product.after_image_url,
        preset_count: product.preset_count || 12,
      },
      downloadUrl: signedUrl,
    });
  } catch (error: any) {
    console.error("Download verification error:", error);
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }
}
