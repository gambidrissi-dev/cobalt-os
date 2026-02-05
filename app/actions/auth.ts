"use server";

import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // <--- IMPÉRATIF

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

// 1. SE CONNECTER
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email } });

  // Sécurité : On vérifie si l'user existe ET si le hash correspond
  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Note: Dans une vraie app, on retournerait une erreur pour l'afficher côté client
    // Pour simplifier ici, on redirige ou on ne fait rien (ce qui n'est pas idéal UX, mais sûr)
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

  // Gestion entité par défaut
  const defaultEntity = user.allowedEntities.split(',')[0] || "GLOBAL";
  cookieStore.set("cobalt_entity", defaultEntity);

  redirect("/");
}

// 2. UPDATE PASSWORD (HASHAGE)
export async function updatePasswordAction(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  
  const user = await getCurrentUser();
  
  // Vérification de l'ancien mot de passe haché
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
     return { error: "Mot de passe actuel incorrect" };
  }

  // Hachage du nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({ 
    where: { id: user.id }, 
    data: { password: hashedPassword } 
  });
  
  revalidatePath("/profile");
  redirect("/");
}

// 3. SETUP FIRST ADMIN (HASHAGE)
export async function createFirstAdmin(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  
  // On hache le mot de passe par défaut
  const hashedPassword = await bcrypt.hash("cobalt123", 10);

  await prisma.user.create({
    data: {
      name, email, 
      password: hashedPassword, // <--- HASHÉ
      role: "PRESIDENT", job: "Fondateur", title: "Fondateur",
      allowedEntities: "ARCHI,ATELIER,GLOBAL"
    }
  });
  redirect("/login");
}

// ... Les autres fonctions (logout, getCurrentUser...) restent identiques
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("cobalt_session");
  cookieStore.delete("cobalt_entity");
  redirect("/login");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("cobalt_session")?.value;
  if (!userId) return null;
  return await prisma.user.findUnique({ where: { id: userId } });
}

export async function getActiveEntity() {
  const cookieStore = await cookies();
  const user = await getCurrentUser();
  if (!user) return "GLOBAL";
  const requestedEntity = cookieStore.get("cobalt_entity")?.value || "GLOBAL";
  const allowedEntities = user.allowedEntities.split(',');
  
  // LOGIQUE 3 COMPTES : Accès à sa liste + GLOBAL + MEDIA
  const hasAccess = allowedEntities.includes(requestedEntity) || ['GLOBAL', 'MEDIA'].includes(requestedEntity) || allowedEntities.includes('ALL');
  
  // Si l'entité demandée n'est pas permise, on renvoie vers GLOBAL par sécurité
  return hasAccess ? requestedEntity : "GLOBAL";
}

export async function switchEntityAction(entity: string) {
  const cookieStore = await cookies();
  const user = await getCurrentUser();
  if (!user) return;
  const allowedEntities = user.allowedEntities.split(',');
  if (allowedEntities.includes(entity) || ['GLOBAL', 'MEDIA'].includes(entity) || allowedEntities.includes('ALL')) {
    cookieStore.set("cobalt_entity", entity);
  }
  redirect("/"); 
}