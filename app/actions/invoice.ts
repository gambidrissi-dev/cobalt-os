"use server";

import { prisma } from "@/app/lib/prisma";
import { getActiveEntity } from "./auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNextInvoice() {
  const entity = await getActiveEntity();
  const year = new Date().getFullYear();
  
  // 1. Chercher la dernière facture de cette entité pour cette année
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      entity: entity,
      number: { startsWith: `FAC-${entity}-${year}` }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Calculer le prochain numéro (ex: 005)
  let nextSequence = 1;
  if (lastInvoice) {
    const parts = lastInvoice.number.split('-');
    const lastSeq = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
  }

  // 3. Formater : FAC-ARCHI-2024-001
  const sequenceStr = nextSequence.toString().padStart(3, '0');
  const number = `FAC-${entity}-${year}-${sequenceStr}`;

  // 4. Créer la facture brouillon
  // --- RECHERCHE INTELLIGENTE DU CLIENT ---
  let defaultClient = await prisma.client.findFirst({ where: { entity } });
  
  // Si aucun client n'existe, on en crée un "Divers" à la volée pour ne pas bloquer
  if (!defaultClient) {
    defaultClient = await prisma.client.create({
      data: {
        name: "Client Divers",
        type: "Autre",
        entity: entity
      }
    });
  }

  const newInvoice = await prisma.invoice.create({
    data: {
      number,
      entity,
      status: "DRAFT",
      totalHT: 0,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // J+30
      clientId: defaultClient.id
    }
  });

  revalidatePath("/finance");
  redirect(`/invoices/${newInvoice.id}`);
}

export async function updateInvoice(id: string, data: any) {
  await prisma.invoice.update({
    where: { id },
    data
  });
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/finance");
}