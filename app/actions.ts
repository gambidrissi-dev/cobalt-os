"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";

// --- ACTIONS CRM ---
export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const type = formData.get("type") as string;
  if (!name) return;
  await prisma.client.create({ data: { name, email, type } });
  revalidatePath("/crm");
}

// --- ACTIONS RH ---
export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  if (!name || !email) return;
  try {
    await prisma.user.create({
      data: { name, email, role: role || "membre", password: "temp_password_cobalt" }
    });
    revalidatePath("/hr");
  } catch (error) {
    console.error("Erreur RH:", error);
  }
}

// --- ACTIONS FINANCE ---
export async function createQuickInvoice(formData: FormData) {
  const firstClient = await prisma.client.findFirst();
  if (!firstClient) return;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  await prisma.invoice.create({
    data: {
      number: `FAC-${Date.now().toString().slice(-6)}`,
      status: "DRAFT",
      totalHT: 0,
      clientId: firstClient.id,
      dueDate: dueDate 
    }
  });
  revalidatePath("/finance");
  revalidatePath("/"); 
}

// --- ACTIONS PROJETS ---
export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const clientId = formData.get("clientId") as string;
  if (!title) return;
  await prisma.project.create({
    data: { title, type: type || "Autre", priority, status: "TODO", clientId }
  });
  revalidatePath("/projects");
}

// ACTION DE PERSONNALISATION V2
export async function updateProjectAction(formData: FormData) {
  const id = formData.get("projectId") as string;
  const description = formData.get("description") as string;
  const notes = formData.get("notes") as string;
  const budget = parseFloat(formData.get("budget") as string) || 0;
  const driveLink = formData.get("driveLink") as string;

  await prisma.project.update({
    where: { id },
    data: { description, notes, budget, driveLink }
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
}

// --- ACTIONS INVENTAIRE ---
export async function createInventoryItem(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  if (!name || !category) return;
  await prisma.inventoryItem.create({ data: { name, category, status: "AVAILABLE" } });
  revalidatePath("/inventory");
}

export async function borrowItem(id: string, borrowerName: string) {
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 7);
  await prisma.inventoryItem.update({
    where: { id },
    data: { status: "BORROWED", borrower: borrowerName, returnDate }
  });
  revalidatePath("/inventory");
}

export async function returnItem(id: string) {
  await prisma.inventoryItem.update({
    where: { id },
    data: { status: "AVAILABLE", borrower: null, returnDate: null }
  });
  revalidatePath("/inventory");
}

// --- SUPPRESSIONS & SYSTEME ---
export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/crm");
}

export async function resetDatabase() {
  await prisma.invoiceItem.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.inventoryItem.deleteMany();
  revalidatePath("/");
}