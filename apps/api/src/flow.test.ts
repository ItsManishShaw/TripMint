import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "./index";

const prisma = new PrismaClient();

const flightId = "FL-INDIGO-0610";

async function cleanDb() {
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.traveller.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.user.deleteMany();
}

describe("booking flow", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanDb();
  });

  it("creates a booking after payment capture", async () => {
    const email = `user-${Date.now()}@example.com`;
    const password = "pass1234";

    const register = await request(app)
      .post("/auth/register")
      .send({ email, password, name: "Test User" });

    expect(register.status).toBe(200);
    const token = register.body.token as string;

    const cartRes = await request(app).post("/carts").send({});
    expect(cartRes.status).toBe(200);
    const cartId = cartRes.body.cart.id as string;

    const addItemRes = await request(app).post(`/carts/${cartId}/items`).send({ flightId });
    expect(addItemRes.status).toBe(200);

    const travellersRes = await request(app)
      .post(`/carts/${cartId}/travellers`)
      .send({ travellers: [{ firstName: "A", lastName: "B", gender: "MALE" }] });
    expect(travellersRes.status).toBe(200);

    const lockRes = await request(app).post(`/carts/${cartId}/lock`).send({});
    expect(lockRes.status).toBe(200);

    const paymentRes = await request(app)
      .post(`/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ cartId });
    expect(paymentRes.status).toBe(200);

    const paymentId = paymentRes.body.payment.id as string;
    const confirmRes = await request(app)
      .post(`/payments/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .send({ paymentId });
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.payment.status).toBe("CAPTURED");

    const bookingRes = await request(app)
      .post(`/bookings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ cartId });
    expect(bookingRes.status).toBe(200);
    expect(bookingRes.body.booking.status).toBe("CONFIRMED");

    const listRes = await request(app).get(`/bookings`).set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.bookings.length).toBe(1);
  });
});
