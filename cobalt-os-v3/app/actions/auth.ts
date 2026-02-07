"use server";

import { z } from "zod"; // Assure-toi d'avoir installé zod: npm i zod
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Validation des données
  const validated = loginSchema.safeParse({ email, password });
  if (!validated.success) {
    return { error: "Format d'email invalide ou mot de passe trop court." };
  }

  // 2. Recherche de l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: validated.data.email },
  });

  // 3. Vérification du mot de passe
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Identifiants incorrects." };
  }

  // 4. Création de la session (Cookie)
  const expires = new Date(Date.now() + SESSION_DURATION);
  const cookieStore = await cookies();
  
  cookieStore.set("cobalt_session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });

  // 5. Redirection vers le Dashboard (Micro-Entreprise par défaut)
  redirect("/private/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("cobalt_session");
  redirect("/login");
}