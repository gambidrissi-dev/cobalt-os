"use server";
import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { getActiveEntity } from "./actions/auth";

// --- ACTIONS CRM (CLIENTS) ---
export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const type = formData.get("type") as string;
  const entity = await getActiveEntity();

  if (!name) return;
await prisma.client.create({
  data: {
    name,
    email,
    type,
    entity: entity || "GLOBAL"
  }
});
  revalidatePath("/crm");
}

// --- ACTIONS FINANCE (V2 : ÉDITION COMPLÈTE) ---
export async function createQuickInvoice(formData: FormData) {
  const firstClient = await prisma.client.findFirst();
  if (!firstClient) return;
  const entity = await getActiveEntity();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  await prisma.invoice.create({
    data: {
      entity: entity || "GLOBAL",
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

// Action pour sauvegarder une facture "de long en large"
export async function updateInvoiceAction(formData: FormData) {
  const id = formData.get("invoiceId") as string;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const status = formData.get("status") as string;
  const dueDate = formData.get("dueDate") as string;

  await prisma.invoice.update({
    where: { id },
    data: { 
      totalHT: amount, 
      status, 
      dueDate: new Date(dueDate)
    }
  });

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/finance");
  revalidatePath("/");
}

// --- ACTIONS PROJETS (V2 : DEEP DIVE & KANBAN) ---
export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  const entity = formData.get("entity") as string;
  const clientName = formData.get("clientName") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const activeEntity = await getActiveEntity();

  if (!title) return;

  await prisma.project.create({
    data: { 
      title, 
      status: "TODO",
      entity: entity || activeEntity || "GLOBAL",
      clientName: clientName || "",
      dueDate: dueDateStr ? new Date(dueDateStr) : null
    }
  });
  revalidatePath("/projects");
}

// Action pour le Drag & Drop du Kanban
export async function updateProjectStatus(projectId: string, newStatus: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { status: newStatus }
  });
  revalidatePath("/projects");
  revalidatePath("/");
}

// Action pour personnaliser le projet (Brief, Notes, Budget, Drive)
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
  if (process.env.NODE_ENV === 'production') {
    throw new Error("Action interdite en production");
  }

  await prisma.invoiceItem.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.inventoryItem.deleteMany();
  revalidatePath("/");
  revalidatePath("/crm");
  revalidatePath("/finance");
  revalidatePath("/projects");
  revalidatePath("/hr");
  revalidatePath("/inventory");
}

// --- ACTIONS DES TÂCHES (CHECKLIST) ---
export async function addTaskAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const title = formData.get("title") as string;

  if (!title || !projectId) return;

  await prisma.task.create({
    data: {
      title,
      projectId,
      done: false
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function toggleTaskAction(taskId: string, projectId: string, currentStatus: boolean) {
  await prisma.task.update({
    where: { id: taskId },
    data: { done: !currentStatus }
  });

  revalidatePath(`/projects/${projectId}`);
}

// --- ACTION ASSIGNATION ÉQUIPE ---
export async function assignUserToProject(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const userId = formData.get("userId") as string;

  if (!projectId || !userId) return;

  await prisma.project.update({
    where: { id: projectId },
    data: { 
      notes: `Responsable assigné : ${userId}`
    }
  });

  revalidatePath(`/projects/${projectId}`);
}