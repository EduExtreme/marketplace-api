"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { AUTH_ERROR_CODES, type AuthActionState } from "@/lib/auth/errors";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

export async function signup(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState | undefined> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errorCode: AUTH_ERROR_CODES.validationError };
  }

  const { email, password } = parsed.data;

  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) {
    return { errorCode: AUTH_ERROR_CODES.emailTaken };
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning({ id: users.id });

  if (!user) {
    return { errorCode: AUTH_ERROR_CODES.unknown };
  }

  await createSession(user.id);
  redirect("/account");
}

export async function login(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState | undefined> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errorCode: AUTH_ERROR_CODES.validationError };
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { errorCode: AUTH_ERROR_CODES.invalidCredentials };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return { errorCode: AUTH_ERROR_CODES.invalidCredentials };
  }

  await createSession(user.id);
  redirect("/account");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
