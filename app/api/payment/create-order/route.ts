import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { getServerSupabase } from "../../../lib/supabase";
import { INITIAL_PRESETS } from "../../../lib/store";

export async function POST(req: Request) {
  const envValue = (process.env.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENV || "PRODUCTION").trim().toUpperCase();
  const clientId = (process.env.CASHFREE_APP_ID || "").trim();
  const clientSecret = (process.env.CASHFREE_SECRET_KEY || "").trim();
  const supabase = getServerSupabase();

  try {
    const { productId, customerEmail, customerName, customerPhone, promoCode } = await req.json();

    if (!productId || !customerEmail) {
      return NextResponse.json({ error: "Product ID and customer email are required" }, { status: 400 });
    }

    // 1. Fetch product securely from DB (or fallback initial presets)
    let product: any = null;
    const { data: dbProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (dbProduct) {
      product = dbProduct;
    } else {
      product = INITIAL_PRESETS.find((p) => p.id === productId);
    }

    if (!product) {
      return NextResponse.json({ error: "Selected preset was not found" }, { status: 404 });
    }

    let finalPrice = Number(product.price);

    // 2. Validate Promo Code server-side
    if (promoCode) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase().trim())
        .eq("is_active", true)
        .maybeSingle();

      if (promo) {
        const discountAmount = (finalPrice * Number(promo.discount_percentage)) / 100;
        finalPrice = Math.max(1, finalPrice - discountAmount);
      }
    }

    // 3. Generate unique order ID and reference
    const orderRef = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 4. Save initial pending order in Database
    try {
      await supabase.from("orders").insert({
        order_reference: orderRef,
        customer_email: customerEmail.trim().toLowerCase(),
        customer_name: customerName || "Guest Customer",
        customer_phone: customerPhone || null,
        total_amount: Number(finalPrice.toFixed(2)),
        status: "pending",
      });
    } catch (dbErr) {
      console.warn("Could not insert pending order into DB:", dbErr);
    }

    const reqUrl = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || reqUrl.origin;

    // 5. Build Cashfree Order Payload
    const sanitizedCustomerId = (customerEmail.replace(/[^a-zA-Z0-9]/g, "") || `cust_${Date.now()}`).substring(0, 45);
    const sanitizedPhone = (customerPhone || "9876543210").replace(/[^0-9]/g, "").padEnd(10, "0").substring(0, 10);

    const cashfreePayload = {
      order_amount: Number(finalPrice.toFixed(2)),
      order_currency: "INR",
      order_id: orderRef,
      customer_details: {
        customer_id: sanitizedCustomerId,
        customer_name: customerName || "Preset Customer",
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: sanitizedPhone,
      },
      order_meta: {
        return_url: `${baseUrl}/api/payment/verify?order_id=${orderRef}&product_id=${productId}`,
      },
    };

    // Determine Cashfree Endpoint & Headers
    const isProduction = envValue === "PRODUCTION";
    const apiEndpoint = isProduction 
      ? "https://api.cashfree.com/pg/orders" 
      : "https://sandbox.cashfree.com/pg/orders";

    // Direct Cashfree REST invocation with standard 2023-08-01 API version
    try {
      const directRes = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "x-client-id": clientId,
          "x-client-secret": clientSecret,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(cashfreePayload),
      });

      const resData = await directRes.json();

      if (directRes.ok && resData.payment_session_id) {
        return NextResponse.json({
          paymentSessionId: resData.payment_session_id,
          orderId: resData.order_id || orderRef,
          environment: isProduction ? "production" : "sandbox",
        });
      }

      // If direct REST returned an error, check if sandbox/prod environment mismatch occurred
      if (!directRes.ok && resData.message && resData.message.toLowerCase().includes("authentication")) {
        // Try opposite environment (e.g. sandbox if prod key is sandbox or vice-versa)
        const altEndpoint = !isProduction
          ? "https://api.cashfree.com/pg/orders"
          : "https://sandbox.cashfree.com/pg/orders";

        const altRes = await fetch(altEndpoint, {
          method: "POST",
          headers: {
            "x-client-id": clientId,
            "x-client-secret": clientSecret,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(cashfreePayload),
        });

        const altData = await altRes.json();
        if (altRes.ok && altData.payment_session_id) {
          return NextResponse.json({
            paymentSessionId: altData.payment_session_id,
            orderId: altData.order_id || orderRef,
            environment: !isProduction ? "production" : "sandbox",
          });
        }
      }

      if (resData.message) {
        throw new Error(resData.message);
      }
    } catch (restErr: any) {
      // Fallback to cashfree-pg SDK with 2023-08-01 version
      try {
        // @ts-ignore
        Cashfree.XClientId = clientId;
        // @ts-ignore
        Cashfree.XClientSecret = clientSecret;
        // @ts-ignore
        Cashfree.XEnvironment = isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

        const cashfree = new Cashfree(
          isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
          clientId,
          clientSecret
        );
        // @ts-ignore
        cashfree.XApiVersion = "2023-08-01";

        const sdkRes = await cashfree.PGCreateOrder(cashfreePayload);
        if (sdkRes.data && sdkRes.data.payment_session_id) {
          return NextResponse.json({
            paymentSessionId: sdkRes.data.payment_session_id,
            orderId: sdkRes.data.order_id || orderRef,
            environment: isProduction ? "production" : "sandbox",
          });
        }
      } catch (sdkErr: any) {
        console.error("SDK Fallback Error:", sdkErr);
      }

      throw restErr;
    }

    throw new Error("Unable to obtain Cashfree payment session.");

  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Could not initialize payment gateway";
    console.error("Payment Order Creation Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
