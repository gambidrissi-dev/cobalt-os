"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActiveEntity } from "@/app/actions/auth";

export async function createQuickInvoice(formData: FormData) {
  const firstClient = await prisma.client.findFirst();
  if (!firstClient) return;
  const entity = await getActiveEntity();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  await prisma.invoice.create({
    data: { entity: entity || "GLOBAL", number: `FAC-${Date.now().toString().slice(-6)}`, status: "DRAFT", totalHT: 0, clientId: firstClient.id, dueDate: dueDate }
  });
  revalidatePath("/finance");
}
