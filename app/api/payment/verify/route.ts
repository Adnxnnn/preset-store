import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { supabase } from "../../../lib/supabase";
import { Resend } from "resend";



export async function GET(req: Request) {
  const envValue = (process.env.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENV || "").trim().toUpperCase();
  // @ts-ignore
  Cashfree.XClientId = process.env.CASHFREE_APP_ID || "";
  // @ts-ignore
  Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || "";
  // @ts-ignore
  Cashfree.XEnvironment = envValue === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");
  
  const reqUrl = new URL(req.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || reqUrl.origin || 'https://preset-store.tsadnan39.workers.dev';

  try {
    const orderId = reqUrl.searchParams.get('order_id');
    const productId = reqUrl.searchParams.get('product_id');

    if (!orderId || !productId) {
      return NextResponse.redirect(`${baseUrl}/payment/failed`);
    }

    // 1. Verify Payment with Cashfree
    // @ts-ignore
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
    
    // Find a SUCCESS payment
    const payment = response.data?.find((p: any) => p.payment_status === "SUCCESS");

    if (!payment) {
      return NextResponse.redirect(`${baseUrl}/payment/failed`);
    }

    // 2. Fetch Product Details
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!product) throw new Error("Product not found");

    // 3. Generate Secure Signed Download URL (valid for 24 hours)
    const { data: signedUrlData } = await supabase.storage
      .from('product-files')
      .createSignedUrl(product.file_url, 60 * 60 * 24);

    const downloadLink = signedUrlData?.signedUrl;

    // 4. Record Order in Supabase Database for Admin Dashboard & Analytics
    const customerEmail = response.data[0]?.payment_group_details?.customer_email || "customer@example.com";
    const orderAmount = payment.payment_amount || product.price;

    let userId: string | null = null;
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;
    }

    try {
      const orderPayload: any = {
        total_amount: orderAmount,
        status: 'paid',
        payment_session_id: orderId,
      };
      if (userId) {
        orderPayload.user_id = userId;
      }

      const { data: insertedOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('id')
        .maybeSingle();

      if (insertedOrder) {
        await supabase.from('order_items').insert({
          order_id: insertedOrder.id,
          product_id: product.id,
          price_at_purchase: orderAmount,
        });
      }
    } catch (dbErr) {
      console.error("Error inserting order to database:", dbErr);
    }

    // 5. Send Email via Resend
    await resend.emails.send({
      from: 'Luma Presets <noreply@yourdomain.com>', // User needs to verify domain in Resend
      to: customerEmail,
      subject: `Your Receipt & Download: ${product.title}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h1 style="color: #111;">Thank you for your purchase!</h1>
          <p style="color: #555; font-size: 16px;">We have received your payment of ₹${orderAmount} for <strong>${product.title}</strong>.</p>
          <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <a href="${downloadLink}" style="background: #111; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Download Your Preset
            </a>
            <p style="font-size: 12px; color: #888; margin-top: 15px;">This secure link will expire in 24 hours.</p>
          </div>
          <p style="color: #555;">Order ID: ${orderId}</p>
        </div>
      `
    });

    // 6. Redirect to Success Page
    return NextResponse.redirect(`${baseUrl}/payment/success?order_id=${orderId}&product_id=${productId}`);

  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.redirect(`${baseUrl}/payment/failed`);
  }
}
