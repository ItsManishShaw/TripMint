import type { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";
import { signToken, getAuthUser } from "../middleware/auth";

const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const UpdateProfileBody = z.object({
  name: z.string().min(1).optional(),
});

export async function register(req: Request, res: Response) {
  const { email, password, name } = RegisterBody.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { id: `USR-${crypto.randomUUID()}`, email, name, passwordHash },
  });

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = LoginBody.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

export async function me(req: Request, res: Response) {
  const user = getAuthUser(req);
  res.json({ user });
}

export async function updateProfile(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const { name } = UpdateProfileBody.parse(req.body);

  const user = await prisma.user.update({
    where: { id: authUser.id },
    data: { name: name ?? null },
  });

  res.json({ user: { id: user.id, email: user.email, name: user.name } });
}
