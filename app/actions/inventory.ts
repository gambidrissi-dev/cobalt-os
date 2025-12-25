"use server";

import { prisma } from "@/app/lib/prisma";
import { getActiveEntity } from "./auth";
import { revalidatePath } from "next/cache";

// Créer un objet
export async function createItem(formData: FormData) {
  const entity = await getActiveEntity();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;

  if (!name) return;

  await prisma.inventoryItem.create({
    data: {
      name,
      category,
      entity, // On lie l'objet à l'entité active (Archi ou Atelier)
      status: "AVAILABLE",
    },
  });
  revalidatePath("/inventory");
}

// Supprimer un objet
export async function deleteItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/inventory");
}

// Emprunter un objet (Assigner à quelqu'un)
export async function borrowItem(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const borrowerName = formData.get("borrowerName") as string; 

  // On cherche l'utilisateur par son nom
  const user = await prisma.user.findFirst({
    where: { name: borrowerName }
  });

  if (!user) return; 

  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      status: "BORROWED",
      borrowerId: user.id,
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 jours par défaut
    }
  });
  revalidatePath("/inventory");
}

// Rendre un objet
export async function returnItem(id: string) {
  await prisma.inventoryItem.update({
    where: { id },
    data: {
      status: "AVAILABLE",
      borrowerId: null,
      returnDate: null
    }
  });
  revalidatePath("/inventory");
}