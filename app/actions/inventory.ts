"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createItem(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  if (!name) return;
  await prisma.inventoryItem.create({ data: { name, category, status: "AVAILABLE" } });
  revalidatePath("/inventory");
}

export async function deleteItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/inventory");
}

export async function borrowItem(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const borrowerName = formData.get("borrowerName") as string;
  const user = await prisma.user.findFirst({ where: { name: borrowerName } });
  if (!user) return;
  await prisma.inventoryItem.update({ where: { id: itemId }, data: { status: "BORROWED", borrowerId: user.id, returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  revalidatePath("/inventory");
}

export async function returnItem(id: string) {
  await prisma.inventoryItem.update({ where: { id }, data: { status: "AVAILABLE", borrowerId: null, returnDate: null } });
  revalidatePath("/inventory");
}
