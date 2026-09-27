import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { getServerSupabase } from "../../../lib/supabase";
import { Resend } from "resend";
import { INITIAL_PRESETS } from "../../../lib/store";
import crypto from "crypto";

export async function GET(req: Request) {
  const envValue = (process.env.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENV || "PRODUCTION").trim().toUpperCase();
  const clientId = (process.env.CASHFREE_APP_ID || "").trim();
  const clientSecret = (process.env.CASHFREE_SECRET_KEY || "").trim();
  const supabase = getServerSupabase();
  const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

  const reqUrl = new URL(req.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || reqUrl.origin;

  try {
    const orderId = reqUrl.searchParams.get('order_id');
    const productId = reqUrl.searchParams.get('product_id');

    if (!orderId || !productId) {
      return NextResponse.redirect(`${baseUrl}/payment-success?status=failed`);
    }

    // 1. Server-side verification directly with Cashfree REST API
    let paymentsList: any[] = [];
    const isProduction = envValue === "PRODUCTION";
    const apiEndpoint = isProduction
      ? `https://api.cashfree.com/pg/orders/${orderId}/payments`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`;

    try {
      const fetchRes = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
          "x-client-id": clientId,
          "x-client-secret": clientSecret,
          "x-api-version": "2023-08-01",
          "Accept": "application/json",
        },
      });

      if (fetchRes.ok) {
        const fetchedData = await fetchRes.json();
        paymentsList = Array.isArray(fetchedData) ? fetchedData : [fetchedData];
      } else {
        // Try alternate environment if authentication error
        const altEndpoint = !isProduction
          ? `https://api.cashfree.com/pg/orders/${orderId}/payments`
          : `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`;

        const altRes = await fetch(altEndpoint, {
          method: "GET",
          headers: {
            "x-client-id": clientId,
            "x-client-secret": clientSecret,
            "x-api-version": "2023-08-01",
            "Accept": "application/json",
          },
        });

        if (altRes.ok) {
          const altData = await altRes.json();
          paymentsList = Array.isArray(altData) ? altData : [altData];
        }
      }
    } catch (restErr) {
      console.warn("REST Payment Fetch error, attempting SDK:", restErr);
    }

    // Fallback to SDK if needed
    if (paymentsList.length === 0) {
      try {
        const cashfree = new Cashfree(
          isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
          clientId,
          clientSecret
        );
        // @ts-ignore
        cashfree.XApiVersion = "2023-08-01";
        const sdkResponse = await cashfree.PGOrderFetchPayments(orderId);
        paymentsList = sdkResponse.data || [];
      } catch (sdkErr) {
        console.warn("SDK Fetch Payments error:", sdkErr);
      }
    }
    
    // Find verified SUCCESS payment record
    const successfulPayment = Array.isArray(paymentsList)
      ? paymentsList.find((p: any) => p.payment_status === "SUCCESS")
      : null;

    if (!successfulPayment) {
      console.warn(`Payment for order ${orderId} is not SUCCESS:`, paymentsList);
      return NextResponse.redirect(`${baseUrl}/payment-success?status=failed&order_id=${orderId}`);
    }

    // 2. Fetch Product Details
    let product: any = null;
    const { data: dbProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (dbProduct) {
      product = dbProduct;
    } else {
      product = INITIAL_PRESETS.find(p => p.id === productId);
    }

    if (!product) {
      throw new Error("Product not found for verified order");
    }

    // 3. Generate Secure Unique Download Token & Temporary Signed URL
    const downloadToken = crypto.randomBytes(24).toString('hex');
    let signedDownloadUrl = "";

    if (product.file_url) {
      if (product.file_url.startsWith('http')) {
        signedDownloadUrl = product.file_url;
      } else {
        const { data: signedData, error: signErr } = await supabase.storage
          .from('product-files')
          .createSignedUrl(product.file_url, 60 * 60 * 24); // 24 hours expiry

        if (!signErr && signedData?.signedUrl) {
          signedDownloadUrl = signedData.signedUrl;
        }
      }
    }

    // 4. Update or Insert Order Record in Database as PAID
    const customerEmail = (successfulPayment as any)?.payment_group_details?.customer_email || 
                          (successfulPayment as any)?.customer_details?.customer_email || 
                          "customer@example.com";
    const orderAmount = (successfulPayment as any)?.payment_amount || product.price;

    try {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('order_reference', orderId)
        .maybeSingle();

      if (existingOrder) {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            download_token: downloadToken,
            payment_session_id: orderId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingOrder.id);

        // Record order item if not present
        await supabase.from('order_items').upsert({
          order_id: existingOrder.id,
          product_id: product.id,
          price_at_purchase: orderAmount
        }, { onConflict: 'order_id,product_id' });
      } else {
        const { data: insertedOrder } = await supabase
          .from('orders')
          .insert({
            order_reference: orderId,
            customer_email: customerEmail,
            total_amount: orderAmount,
            status: 'paid',
            payment_session_id: orderId,
            download_token: downloadToken
          })
          .select('id')
          .single();

        if (insertedOrder) {
          await supabase.from('order_items').insert({
            order_id: insertedOrder.id,
            product_id: product.id,
            price_at_purchase: orderAmount
          });
        }
      }

      // Increment product sales count
      await supabase.rpc('increment_sales', { product_id: product.id });
    } catch (dbErr) {
      console.error("Order DB recording error:", dbErr);
    }

    // 5. Send Email with Receipt and Secure Download Link via Resend
    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy') {
        const directLink = signedDownloadUrl || `${baseUrl}/payment-success?order_id=${orderId}&token=${downloadToken}&product_id=${productId}`;
        
        await resend.emails.send({
          from: 'Luma Presets <orders@resend.dev>',
          to: customerEmail,
          subject: `Your Download & Receipt: ${product.title}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; color: #111111; border-radius: 12px; border: 1px solid #eaeaea;">
              <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #000;">Thank you for your order!</h1>
              <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
                Your payment of <strong>₹${orderAmount}</strong> for <strong>${product.title}</strong> has been successfully verified.
              </p>
              
              <div style="background: #f7f7f8; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 14px; color: #666; margin-bottom: 16px;">Click below to access your instant digital download:</p>
                <a href="${directLink}" style="display: inline-block; background: #000000; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 15px;">
                  Download Preset Package
                </a>
                <p style="font-size: 12px; color: #888; margin-top: 14px;">This download link is securely generated for your order.</p>
              </div>

              <div style="border-top: 1px solid #eaeaea; padding-top: 16px; font-size: 13px; color: #777;">
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Preset:</strong> ${product.title} (${product.format || '.XMP & .DNG'})</p>
              </div>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.warn("Resend email delivery skipped or failed:", emailErr);
    }

    // 6. Redirect to Success Page
    return NextResponse.redirect(
      `${baseUrl}/payment-success?order_id=${orderId}&token=${downloadToken}&product_id=${productId}`
    );

  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.redirect(`${baseUrl}/payment-success?status=failed`);
  }
}
