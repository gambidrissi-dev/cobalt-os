"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Créer une nouvelle page
export async function createWikiPage(formData: FormData) {
  const title = formData.get("title") as string;
  // On peut lier à un projet si besoin, mais optionnel
  const projectId = formData.get("projectId") as string; 

  if (!title) return;

  const newPage = await prisma.wikiPage.create({
    data: {
      title,
      content: "<h1>Nouvelle page</h1><p>Commencez à écrire ici...</p>", // Contenu par défaut
      projectId: projectId || null
    }
  });

  // On redirige vers la nouvelle page
  revalidatePath("/wiki");
}

// 2. Mettre à jour le contenu (Sauvegarde)
export async function updateWikiPage(formData: FormData) {
  const pageId = formData.get("pageId") as string;
  const content = formData.get("content") as string;

  await prisma.wikiPage.update({
    where: { id: pageId },
    data: { content }
  });

  revalidatePath("/wiki");
}

// 3. Supprimer une page
export async function deleteWikiPage(pageId: string) {
  await prisma.wikiPage.delete({ where: { id: pageId } });
  revalidatePath("/wiki");
}