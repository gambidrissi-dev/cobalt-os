"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const type = formData.get("type") as string;
  const entities = formData.getAll("entities") as string[]; 
  const entityString = entities.join(","); 
  if (!name) return;
  await prisma.client.create({ data: { name, email: email || "", type, entity: entityString || "GLOBAL" } });
  revalidatePath("/crm");
}

export async function deleteClient(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId }, include: { invoices: true } });
  if (client && client.invoices.length > 0) return { error: "Impossible de supprimer un client facturé." };
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/crm");
}
