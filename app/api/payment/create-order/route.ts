import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

function errorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    error.response.status === 401
  ) {
    return "Cashfree rejected the configured credentials. Use a matching App ID and Secret Key for the selected environment.";
  }

  return error instanceof Error ? error.message : fallback;
}

export async function POST(req: Request) {
  try {
    const clientId = process.env.CASHFREE_APP_ID?.trim();
    const clientSecret = process.env.CASHFREE_SECRET_KEY?.trim();

    const environment = process.env.CASHFREE_ENVIRONMENT?.trim().toUpperCase();

    if (environment !== "SANDBOX" && environment !== "PRODUCTION") {
      return NextResponse.json(
        { 
          success: false, 
          error: `CASHFREE_ENVIRONMENT must be SANDBOX or PRODUCTION. Currently it is: "${process.env.CASHFREE_ENVIRONMENT || 'undefined'}"` 
        },
        { status: 500 }
      );
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Cashfree credentials are missing",
        },
        { status: 500 }
      );
    }

    let appUrl = process.env.APP_URL;
    if (!appUrl) {
      const host = req.headers.get("host") || "localhost:3000";
      appUrl = `https://${host}`;
    }

    const cashfree = new Cashfree(
      environment === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
      clientId,
      clientSecret
    );

    const orderId = `preset_${Date.now()}`;

    const orderRequest = {
      order_id: orderId,
      order_amount: 499,
      order_currency: "INR",

      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_phone: "9999999999",
        customer_email: "customer@example.com",
      },

      order_meta: {
        return_url: new URL(
          "/payment-success?order_id={order_id}",
          appUrl
        ).toString(),
      },
    };

    const response = await cashfree.PGCreateOrder(orderRequest);

    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentSessionId: response.data.payment_session_id,
      environment: environment.toLowerCase(),
    });
  } catch (error: unknown) {
    console.error("Cashfree order creation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage(error, "Cashfree order creation failed"),
        details: (error as any)?.response?.data || String(error),
      },
      { status: 500 }
    );
  }
}
