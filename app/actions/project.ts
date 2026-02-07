"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActiveEntity } from "@/app/actions/auth";

export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  const entity = formData.get("entity") as string;
  const clientName = formData.get("clientName") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const activeEntity = await getActiveEntity();
  if (!title) return;
  await prisma.project.create({
    data: { title, status: "TODO", entity: entity || activeEntity || "GLOBAL", clientName: clientName || "", dueDate: dueDateStr ? new Date(dueDateStr) : null }
  });
  revalidatePath("/projects");
}

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const userId = formData.get("userId") as string;
  if (!title || !projectId) return;
  await prisma.task.create({ data: { title, projectId, userId: userId || undefined, done: false } });
  revalidatePath(`/projects/${projectId}`);
}

export async function toggleTask(taskId: string, currentStatus: boolean, projectId: string) {
  await prisma.task.update({ where: { id: taskId }, data: { done: !currentStatus } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string) {
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectStatus(projectId: string, status: string, phase: string) {
  await prisma.project.update({ where: { id: projectId }, data: { status, phase } });
  revalidatePath(`/projects/${projectId}`);
}
