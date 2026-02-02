import type { z } from "zod";
import { FlightItinerary, Offer, PriceBreakdown, Cart } from "@travel/shared/schemas";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export async function searchFlights(params: { from: string; to: string }) {
  const url = new URL(API_BASE + "/flights/search");
  url.searchParams.set("from", params.from);
  url.searchParams.set("to", params.to);
  const data = await j<{ flights: z.infer<typeof FlightItinerary>[] }>(
    await fetch(url.toString(), { cache: "no-store" }),
  );
  return data.flights;
}

export async function createCart() {
  const data = await j<{ cart: z.infer<typeof Cart> }>(
    await fetch(API_BASE + "/carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
  );
  return data.cart;
}

export async function addItem(cartId: string, flightId: string) {
  const data = await j<{ cart: z.infer<typeof Cart>; price: z.infer<typeof PriceBreakdown> }>(
    await fetch(API_BASE + `/carts/${cartId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flightId }),
    }),
  );
  return data;
}

export async function addTravellers(cartId: string, travellers: any[]) {
  const data = await j<{ cart: z.infer<typeof Cart> }>(
    await fetch(API_BASE + `/carts/${cartId}/travellers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ travellers }),
    }),
  );
  return data.cart;
}

export async function listOffers(cartId: string) {
  const data = await j<{
    bestOffer?: z.infer<typeof Offer>;
    eligibleOffers: z.infer<typeof Offer>[];
  }>(await fetch(API_BASE + `/carts/${cartId}/offers`, { cache: "no-store" }));
  return data;
}

export async function applyOffer(cartId: string, offerId?: string) {
  const data = await j<{ cart: z.infer<typeof Cart>; price: z.infer<typeof PriceBreakdown> }>(
    await fetch(API_BASE + `/carts/${cartId}/apply-offer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId }),
    }),
  );
  return data;
}

export async function getPrice(cartId: string) {
  const data = await j<{ price: z.infer<typeof PriceBreakdown> }>(
    await fetch(API_BASE + `/carts/${cartId}/price`, { cache: "no-store" }),
  );
  return data.price;
}

export async function lockCart(cartId: string) {
  const data = await j<{ cart: z.infer<typeof Cart>; price: z.infer<typeof PriceBreakdown> }>(
    await fetch(API_BASE + `/carts/${cartId}/lock`, { method: "POST" }),
  );
  return data;
}

export async function createBooking(cartId: string, token?: string) {
  const data = await j<{ booking: { id: string; totalPaid: number; status: string } }>(
    await fetch(API_BASE + `/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ cartId }),
    }),
  );
  return data.booking;
}

export async function listBookings(token?: string) {
  const data = await j<{ bookings: any[] }>(
    await fetch(API_BASE + `/bookings`, { cache: "no-store", headers: { ...authHeaders(token) } }),
  );
  return data.bookings;
}

export async function registerUser(params: { email: string; password: string; name?: string }) {
  const data = await j<{
    token: string;
    user: { id: string; email: string; name?: string | null };
  }>(
    await fetch(API_BASE + `/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }),
  );
  return data;
}

export async function loginUser(params: { email: string; password: string }) {
  const data = await j<{
    token: string;
    user: { id: string; email: string; name?: string | null };
  }>(
    await fetch(API_BASE + `/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }),
  );
  return data;
}

export async function getMe(token: string) {
  const data = await j<{ user: { id: string; email: string; name?: string | null } }>(
    await fetch(API_BASE + `/me`, { headers: { ...authHeaders(token) } }),
  );
  return data.user;
}

export async function updateProfile(token: string, params: { name?: string }) {
  const data = await j<{ user: { id: string; email: string; name?: string | null } }>(
    await fetch(API_BASE + `/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(params),
    }),
  );
  return data.user;
}

export async function createPayment(cartId: string, token: string) {
  const data = await j<{
    payment: { id: string; amount: number; currency: string; status: string };
  }>(
    await fetch(API_BASE + `/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ cartId }),
    }),
  );
  return data.payment;
}

export async function confirmPayment(paymentId: string, token: string) {
  const data = await j<{
    payment: { id: string; amount: number; currency: string; status: string };
  }>(
    await fetch(API_BASE + `/payments/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ paymentId }),
    }),
  );
  return data.payment;
}
