"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error("Action interdite en production");
  }

  // Suppression dans l'ordre pour respecter les contraintes de clés étrangères
  await prisma.timeLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.file.deleteMany();
  await prisma.wikiPage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.transaction.deleteMany();
  
  // On supprime d'abord les users, puis les companies (attention aux relations circulaires)
  // Prisma gère généralement bien cela avec deleteMany si pas de contrainte stricte
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  revalidatePath("/");
}