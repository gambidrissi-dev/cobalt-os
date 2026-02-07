"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

function parseDuration(input: string): number {
  if (!input) return 0;
  const clean = input.toString().toLowerCase().trim().replace(',', '.');
  if (clean.includes('h') || clean.includes(':')) {
    const separator = clean.includes('h') ? 'h' : ':';
    const parts = clean.split(separator);
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    return hours + (minutes / 60);
  }
  return parseFloat(clean) || 0;
}

export async function logTime(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const userId = formData.get("userId") as string;
  const dateStr = formData.get("date") as string;
  const duration = parseDuration(formData.get("duration") as string);
  if (!projectId || !userId || !dateStr) return;
  const date = new Date(dateStr);
  const existingLog = await prisma.timeLog.findFirst({ where: { projectId, userId, date: date } });
  if (existingLog) {
    if (duration > 0) await prisma.timeLog.update({ where: { id: existingLog.id }, data: { duration } });
    else await prisma.timeLog.delete({ where: { id: existingLog.id } });
  } else if (duration > 0) {
    await prisma.timeLog.create({ data: { projectId, userId, date, duration } });
  }
  revalidatePath("/timesheet");
}
