"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";

// Helper robuste (avec check insensible à la casse)
const getRank = (user: any) => {
  if (!user) return 99;

  // 1. Nettoyage de l'email
  const cleanEmail = user.email?.trim().toLowerCase() || "";

  // 👑 GOD MODE : Force Rang 1
  if (cleanEmail === "gambi.drissi@icloud.com") return 1;

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
  const entities = formData.getAll("entities") as string[]; 
  const allowedEntities = entities.join(",");

  if (!name || !email) return;

  await prisma.user.create({
    data: {
      name, email, role, job: job || "Membre", title: title || "", allowedEntities,
      password: "cobalt123", avatar: ""
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
  const entities = formData.getAll("entities") as string[];
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