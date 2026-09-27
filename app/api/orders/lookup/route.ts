import { NextResponse } from "next/server";
import { getServerSupabase } from "../../../lib/supabase";
import { INITIAL_PRESETS } from "../../../lib/store";

export async function POST(req: Request) {
  const supabase = getServerSupabase();

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Please provide an email or order ID" }, { status: 400 });
    }

    const cleanQuery = query.trim().toLowerCase();

    // 1. Query orders table by email OR order_reference
    let ordersQuery = supabase
      .from("orders")
      .select(`
        id,
        order_reference,
        customer_email,
        total_amount,
        status,
        download_token,
        created_at,
        order_items (
          product_id,
          products (
            id,
            title,
            format,
            price,
            after_image_url,
            file_url,
            preset_count
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (cleanQuery.includes("@")) {
      ordersQuery = ordersQuery.eq("customer_email", cleanQuery);
    } else {
      ordersQuery = ordersQuery.or(`order_reference.eq.${query.trim()},download_token.eq.${query.trim()}`);
    }

    const { data: orders, error } = await ordersQuery;

    if (error) {
      console.error("Order lookup error:", error);
      return NextResponse.json({ error: "Failed to search orders" }, { status: 500 });
    }

    // Filter paid orders or orders created
    const paidOrders = (orders || []).filter(o => o.status === 'paid' || o.status === 'completed');

    // 2. Generate active signed download URLs for each product in each order
    const populatedOrders = await Promise.all(
      paidOrders.map(async (order) => {
        const items = await Promise.all(
          (order.order_items || []).map(async (item: any) => {
            let prod = item.products;
            if (!prod && item.product_id) {
              prod = INITIAL_PRESETS.find(p => p.id === item.product_id);
            }

            if (!prod) return null;

            let downloadUrl = "";
            if (prod.file_url) {
              if (prod.file_url.startsWith("http")) {
                downloadUrl = prod.file_url;
              } else {
                const { data: signedData } = await supabase.storage
                  .from("product-files")
                  .createSignedUrl(prod.file_url, 60 * 60 * 24); // 24 hours
                if (signedData?.signedUrl) {
                  downloadUrl = signedData.signedUrl;
                }
              }
            }

            if (!downloadUrl) {
              downloadUrl = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80";
            }

            return {
              id: prod.id,
              title: prod.title,
              format: prod.format || ".XMP & .DNG Files",
              after_image_url: prod.after_image_url,
              preset_count: prod.preset_count || 12,
              download_url: downloadUrl,
            };
          })
        );

        return {
          id: order.id,
          order_reference: order.order_reference,
          created_at: order.created_at,
          total_amount: order.total_amount,
          items: items.filter(Boolean),
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: populatedOrders.filter(o => o.items && o.items.length > 0),
    });
  } catch (err: any) {
    console.error("Lookup exception:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
