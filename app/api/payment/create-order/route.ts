import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { supabase } from "../../../lib/supabase";



export async function POST(req: Request) {
  const envValue = (process.env.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENV || "").trim().toUpperCase();
  // @ts-ignore
  Cashfree.XClientId = process.env.CASHFREE_APP_ID || "";
  // @ts-ignore
  Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || "";
  // @ts-ignore
  Cashfree.XEnvironment = envValue === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  try {
    const { productId, customerEmail, customerName, customerPhone, promoCode } = await req.json();

    if (!productId || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch product securely from DB to prevent price tampering
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let finalPrice = product.price;

    // 1b. Verify Promo Code
    if (promoCode) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (promo) {
        // Apply percentage discount
        const discountAmount = (finalPrice * promo.discount_percentage) / 100;
        finalPrice = finalPrice - discountAmount;
      }
    }

    // 2. Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const reqUrl = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || reqUrl.origin || 'https://preset-store.tsadnan39.workers.dev';

    // 3. Create Cashfree Order
    const sanitizedCustomerId = (customerEmail.replace(/[^a-zA-Z0-9]/g, '') || `cust_${Date.now()}`).substring(0, 45);
    const sanitizedPhone = (customerPhone || "9876543210").replace(/[^0-9]/g, '').padEnd(10, '0').substring(0, 10);

    const request = {
      order_amount: Number(finalPrice.toFixed(2)),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: sanitizedCustomerId,
        customer_name: customerName || "Preset Customer",
        customer_email: customerEmail,
        customer_phone: sanitizedPhone
      },
      order_meta: {
        return_url: `${baseUrl}/api/payment/verify?order_id=${orderId}&product_id=${productId}`,
      }
    };

    // @ts-ignore
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    if (response.data && response.data.payment_session_id) {
      return NextResponse.json({
        paymentSessionId: response.data.payment_session_id,
        orderId: response.data.order_id,
        environment: envValue === "PRODUCTION" ? "production" : "sandbox"
      });
    } else {
      throw new Error(response.data?.message || "Failed to create Cashfree order");
    }

  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Could not initialize payment";
    console.error("Payment Creation Error:", error.response?.data || error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
