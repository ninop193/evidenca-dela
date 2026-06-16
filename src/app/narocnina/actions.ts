"use server";

// Faza B (Stripe): ustvari Checkout sejo za izbrani interval in vrne URL.
// Za zdaj plačilo še ni vzpostavljeno.
export async function createCheckout(
  interval: "month" | "year",
): Promise<{ url?: string; error?: string }> {
  void interval;
  return { error: "Plačila bodo na voljo zelo kmalu. Med preizkusom imaš poln dostop." };
}
