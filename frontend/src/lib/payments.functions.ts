import { apiFetch } from "@/lib/api-client";
import type { PaymentDraft } from "@/lib/local-store";
import { getUserToken } from "@/lib/user-session";

export type RazorpayOrderResponse = {
  key_id: string;
  booking: {
    id: string;
    reference: string;
    room_type_name: string;
    total_cents: number;
    currency: string;
    status: string;
    payment_status: string;
    payment_reference: string | null;
  };
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
};

export type RazorpayVerifyInput = {
  booking_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function createRazorpayOrder(draft: PaymentDraft): Promise<RazorpayOrderResponse> {
  return await apiFetch<RazorpayOrderResponse>("/payments/razorpay/order", {
    method: "POST",
    json: draft,
    token: getUserToken(),
  });
}

export async function verifyRazorpayPayment(input: RazorpayVerifyInput) {
  return await apiFetch<{ ok: true; booking: RazorpayOrderResponse["booking"] }>(
    "/payments/razorpay/verify",
    {
      method: "POST",
      json: input,
      token: getUserToken(),
    },
  );
}
