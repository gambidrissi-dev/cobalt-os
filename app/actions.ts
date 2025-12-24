"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";

// --- ACTIONS CRM (CLIENTS) ---
export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const type = formData.get("type") as string;

  if (!name) return;

  await prisma.client.create({
    data: { name, email, type }
  });

  revalidatePath("/crm"); // On rafraîchit la page CRM
}

// --- ACTIONS RH (MEMBRES) ---
export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!name || !email) return;

  await prisma.user.create({
    data: { 
      name, 
      email, 
      role,
      password: "temp" // Mot de passe temporaire
    }
  });

  revalidatePath("/hr");
}

// --- ACTIONS FINANCE (FACTURE RAPIDE) ---
export async function createQuickInvoice(formData: FormData) {
  // Pour faire simple, on crée une facture brouillon liée au premier client trouvé
  // (Dans la V2 on fera un sélecteur de client complet)
  const firstClient = await prisma.client.findFirst();

  if (!firstClient) return; // Il faut au moins un client !

  await prisma.invoice.create({
    data: {
      number: `FAC-${Date.now().toString().slice(-6)}`, // Numéro auto
      status: "DRAFT",
      totalHT: 0,
      clientId: firstClient.id
    }
  });

  revalidatePath("/finance");
}

// --- ACTIONS PARAMÈTRES (SERVICES) ---
export async function createService(formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  
  if (!name) return;

  await prisma.service.create({
    data: { 
      name, 
      price: price || 0, 
      unit: "Forfait", 
      category: "Autre" 
    }
  });

  revalidatePath("/settings");
}

// ... garde tout le code précédent (createClient, createUser, etc.) ...

// --- ACTION SYSTÈME (RESET DATABASE) ---
export async function resetDatabase() {
  // On supprime dans l'ordre inverse des dépendances
  // (On supprime les factures avant les clients, les tâches avant les projets...)
  
  // 1. Tables dépendantes (Enfants)
  await prisma.invoiceItem.deleteMany();
  await prisma.task.deleteMany();
  
  // 2. Tables principales (Parents)
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  
  // 3. Utilisateurs (sauf si tu veux garder ton admin, mais ici on vide tout)
  await prisma.user.deleteMany();

  revalidatePath("/");
  revalidatePath("/crm");
  revalidatePath("/finance");
  revalidatePath("/projects");
  revalidatePath("/settings");
}