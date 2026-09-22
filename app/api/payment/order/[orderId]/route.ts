import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to verify payment";
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/payment/order/[orderId]">
) {
  const { orderId } = await params;
  const clientId = process.env.CASHFREE_APP_ID;
  const clientSecret = process.env.CASHFREE_SECRET_KEY;
  const environment = process.env.CASHFREE_ENVIRONMENT?.toUpperCase();

  if (!clientId || !clientSecret || (environment !== "SANDBOX" && environment !== "PRODUCTION")) {
    return NextResponse.json({ error: "Cashfree is not configured" }, { status: 500 });
  }

  try {
    const cashfree = new Cashfree(
      environment === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
      clientId,
      clientSecret
    );
    const response = await cashfree.PGFetchOrder(orderId);

    return NextResponse.json({
      orderId: response.data.order_id,
      orderStatus: response.data.order_status,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: 500 }
    );
  }
}
