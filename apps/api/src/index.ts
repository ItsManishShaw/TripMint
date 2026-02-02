import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import { health } from "./routes/health";
import { searchFlights } from "./routes/flights";
import {
  createCart,
  getCart,
  addItem,
  addTravellers,
  listOffers,
  applyOffer,
  lockCart,
  getPrice,
} from "./routes/carts";
import { createBooking, listBookings, getBooking } from "./routes/bookings";
import { register, login, me, updateProfile } from "./routes/auth";
import { requireAuth } from "./middleware/auth";
import { createPayment, confirmPayment } from "./routes/payments";

export const app = express();
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: process.env.NODE_ENV === "production" ? undefined : { target: "pino-pretty" },
});
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((v) => v.trim())
  : true;
app.use(cors({ origin: corsOrigin }));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "200kb" }));
app.use(
  pinoHttp({
    logger: logger as any,
    genReqId: (req) => req.headers["x-request-id"]?.toString() ?? crypto.randomUUID(),
  }),
);

app.get("/health", health);
app.get("/flights/search", searchFlights);

app.post("/auth/register", register);
app.post("/auth/login", login);
app.get("/me", requireAuth, me);
app.patch("/me", requireAuth, updateProfile);

app.post("/carts", createCart);
app.get("/carts/:id", getCart);
app.post("/carts/:id/items", addItem);
app.post("/carts/:id/travellers", addTravellers);
app.get("/carts/:id/offers", listOffers);
app.post("/carts/:id/apply-offer", applyOffer);
app.post("/carts/:id/lock", lockCart);
app.get("/carts/:id/price", getPrice);

app.post("/bookings", requireAuth, createBooking);
app.get("/bookings", requireAuth, listBookings);
app.get("/bookings/:id", requireAuth, getBooking);

app.post("/payments", requireAuth, createPayment);
app.post("/payments/confirm", requireAuth, confirmPayment);

app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(err, "Unhandled error");
    res.status(500).json({ error: "Internal Server Error" });
  },
);

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}
