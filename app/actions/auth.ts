"use server";

import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

// 1. SE CONNECTER
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.password !== password) {
    return { error: "Identifiants incorrects" };
  }

  const expires = new Date(Date.now() + SESSION_DURATION);
  const cookieStore = await cookies();
  
  cookieStore.set("cobalt_session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });

  // À la connexion, on force l'entité par défaut (la première autorisée)
  const defaultEntity = user.allowedEntities.split(',')[0] || "GLOBAL";
  cookieStore.set("cobalt_entity", defaultEntity);

  redirect("/");
}

// 2. SE DÉCONNECTER
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("cobalt_session");
  cookieStore.delete("cobalt_entity");
  redirect("/login");
}

// 3. RÉCUPÉRER L'UTILISATEUR CONNECTÉ
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("cobalt_session")?.value;
  if (!userId) return null;
  return await prisma.user.findUnique({ where: { id: userId } });
}

// 4. RÉCUPÉRER L'ENTITÉ ACTIVE (SÉCURISÉE)
export async function getActiveEntity() {
  const cookieStore = await cookies();
  const user = await getCurrentUser();

  // Si pas d'user, pas d'entité
  if (!user) return "GLOBAL";

  const requestedEntity = cookieStore.get("cobalt_entity")?.value || "GLOBAL";
  const allowedEntities = user.allowedEntities.split(',');

  // SÉCURITÉ : Si l'user essaie d'accéder à GLOBAL ou autre chose sans droit
  // On vérifie si l'entité demandée est dans sa liste OU s'il a le droit "GLOBAL"
  const hasAccess = allowedEntities.includes("GLOBAL") || allowedEntities.includes(requestedEntity);

  if (hasAccess) {
    return requestedEntity;
  } else {
    // Si pas d'accès, on le force sur sa première entité autorisée (ex: ARCHI)
    return allowedEntities[0] || "ARCHI";
  }
}

// 5. CHANGER D'ENTITÉ (SWITCH)
export async function switchEntityAction(entity: string) {
  const cookieStore = await cookies();
  const user = await getCurrentUser();

  if (!user) return;

  const allowedEntities = user.allowedEntities.split(',');

  // On vérifie le droit avant d'appliquer le changement
  if (allowedEntities.includes("GLOBAL") || allowedEntities.includes(entity)) {
    cookieStore.set("cobalt_entity", entity);
  }
  
  redirect("/"); 
}

// 6. UPDATE PASSWORD
export async function updatePasswordAction(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const user = await getCurrentUser();
  if (!user || user.password !== currentPassword) return { error: "Erreur mot de passe" };
  await prisma.user.update({ where: { id: user.id }, data: { password: newPassword } });
  revalidatePath("/profile");
  redirect("/");
}

// 7. SETUP FIRST ADMIN
export async function createFirstAdmin(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  await prisma.user.create({
    data: {
      name, email, password: "cobalt123", role: "PRESIDENT", job: "Fondateur", title: "Fondateur",
      allowedEntities: "ARCHI,ATELIER,GLOBAL"
    }
  });
  redirect("/login");
}