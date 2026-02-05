"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import bcrypt from "bcryptjs"; // <--- 1. IMPORT AJOUTÉ

// Helper robuste (avec check insensible à la casse)
const getRank = (user: any) => {
  if (!user) return 99;

  // 1. Nettoyage de l'email
  const cleanEmail = user.email?.trim().toLowerCase() || "";
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase(); // <--- 2. VARIABLE D'ENVIRONNEMENT

  // 👑 GOD MODE : Force Rang 1 si l'email correspond à celui du .env
  if (adminEmail && cleanEmail === adminEmail) return 1;

  const role = user.role;
  if (role === 'PRESIDENT') return 1;
  if (role === 'DG') return 2;
  if (role === 'ASSOCIE') return 3;
  if (role === 'SALARIE') return 4;
  if (role === 'STAGIAIRE') return 5;
  return 99; 
};

export async function createUser(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;
  
  const myRank = getRank(currentUser);
  if (myRank > 2) return; 

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const job = formData.get("job") as string;
  const title = formData.get("title") as string;
  const entities = formData.getAll("entities").map(e => e.toString());
  const allowedEntities = entities.join(",");

  if (!name || !email) return;

  // <--- 3. HACHAGE DU MOT DE PASSE ---
  // On ne stocke plus "cobalt123" en clair, on le sécurise.
  const hashedPassword = await bcrypt.hash("cobalt123", 10);

  await prisma.user.create({
    data: {
      name, email, role, job: job || "Membre", title: title || "", allowedEntities,
      password: hashedPassword, // On utilise le hash ici
      avatar: ""
    }
  });

  revalidatePath("/hr");
}

export async function updateUser(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;

  const id = formData.get("id") as string;
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) return;

  const myRank = getRank(currentUser);
  const targetRank = getRank(targetUser);

  let isAllowed = false;
  if (myRank === 1) {
    isAllowed = true; 
  } else if (myRank === 2) {
    if (currentUser.id === targetUser.id || targetRank > 2) {
      isAllowed = true;
    }
  }

  if (!isAllowed) return;

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const job = formData.get("job") as string;
  const title = formData.get("title") as string;
  const entities = formData.getAll("entities").map(e => e.toString());
  const allowedEntities = entities.join(",");

  await prisma.user.update({
    where: { id },
    data: { name, email, role, job, title, allowedEntities }
  });

  revalidatePath("/hr");
  redirect("/hr");
}

export async function deleteUser(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return;

  const myRank = getRank(currentUser);
  const targetRank = getRank(targetUser);

  let isAllowed = false;
  if (myRank === 1) isAllowed = true;
  else if (myRank === 2 && targetRank > 2) isAllowed = true;

  if (!isAllowed) return;

  const count = await prisma.user.count();
  if (count <= 1) return;
  
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/hr");
}