"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') throw new Error("Action interdite en production");
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
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  revalidatePath("/");
}
