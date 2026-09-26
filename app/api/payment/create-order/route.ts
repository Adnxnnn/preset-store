import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { supabase } from "../../../lib/supabase";

// Initialize Cashfree
// @ts-ignore
Cashfree.XClientId = process.env.CASHFREE_APP_ID || "";
// @ts-ignore
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || "";
// @ts-ignore
Cashfree.XEnvironment = process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

export async function POST(req: Request) {
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

    // 3. Create Cashfree Order
    const request = {
      order_amount: finalPrice,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, ''),
        customer_name: customerName || "Customer",
        customer_email: customerEmail,
        customer_phone: customerPhone || "9999999999" // Cashfree requires phone
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/verify?order_id=${orderId}&product_id=${productId}`,
      }
    };

    // @ts-ignore
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    if (response.data) {
      return NextResponse.json({
        paymentSessionId: response.data.payment_session_id,
        orderId: response.data.order_id
      });
    } else {
      throw new Error("Failed to create Cashfree order");
    }

  } catch (error: any) {
    console.error("Payment Creation Error:", error.response?.data || error);
    return NextResponse.json({ error: "Could not initialize payment" }, { status: 500 });
  }
}
