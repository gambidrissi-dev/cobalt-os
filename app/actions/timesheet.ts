"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper pour convertir "1h30", "1:30" ou "1,5" en décimal
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

// Saisir un temps (ou le mettre à jour s'il existe déjà pour ce jour/projet/user)
export async function logTime(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const userId = formData.get("userId") as string;
  const dateStr = formData.get("date") as string;
  const duration = parseDuration(formData.get("duration") as string);

  if (!projectId || !userId || !dateStr) return;

  const date = new Date(dateStr);

  // 1. On regarde s'il y a déjà une saisie ce jour-là pour ce projet
  const existingLog = await prisma.timeLog.findFirst({
    where: {
      projectId,
      userId,
      date: date
    }
  });

  if (existingLog) {
    if (duration > 0) {
      // Mise à jour
      await prisma.timeLog.update({
        where: { id: existingLog.id },
        data: { duration }
      });
    } else {
      // Si on met 0, on supprime la ligne pour nettoyer la base
      await prisma.timeLog.delete({ where: { id: existingLog.id } });
    }
  } else if (duration > 0) {
    // Création
    await prisma.timeLog.create({
      data: {
        projectId,
        userId,
        date,
        duration
      }
    });
  }

  revalidatePath("/timesheet");
}