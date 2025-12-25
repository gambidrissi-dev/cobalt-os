"use server";

import { prisma } from "@/app/lib/prisma";
import { getActiveEntity } from "./auth";

export type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: "PROJECT" | "CLIENT" | "INVOICE" | "WIKI" | "ITEM";
  url: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const entity = await getActiveEntity();
  const whereCondition = entity === 'GLOBAL' ? {} : { entity };

  // On initialise un tableau vide
  let results: SearchResult[] = [];

  try {
    // On lance les recherches en parallèle
    const [projects, clients, invoices, wikiPages, items] = await Promise.all([
      // 1. Projets
      prisma.project.findMany({
        where: { ...whereCondition, title: { contains: query } }, // J'ai retiré mode: 'insensitive'
        take: 3
      }).catch(() => []), 

      // 2. Clients
      prisma.client.findMany({
        where: { ...whereCondition, name: { contains: query } },
        take: 3
      }).catch(() => []),

      // 3. Factures
      prisma.invoice.findMany({
        where: { ...whereCondition, number: { contains: query } },
        take: 3
      }).catch(() => []),

      // 4. Wiki
      prisma.wikiPage.findMany({
        where: { title: { contains: query } },
        take: 3
      }).catch(() => []),

      // 5. Matériel
      prisma.inventoryItem.findMany({
        where: { ...whereCondition, name: { contains: query } },
        take: 3
      }).catch(() => [])
    ]);

    // Formatage des résultats
    results = [
      ...projects.map(p => ({
        id: p.id, title: p.title, subtitle: `Projet ${p.status}`, type: "PROJECT" as const, url: `/projects/${p.id}`
      })),
      ...clients.map(c => ({
        id: c.id, title: c.name, subtitle: c.email || "Client", type: "CLIENT" as const, url: `/crm`
      })),
      ...invoices.map(i => ({
        id: i.id, title: i.number, subtitle: `${i.totalHT}€ HT`, type: "INVOICE" as const, url: `/invoices/${i.id}`
      })),
      ...wikiPages.map(w => ({
        id: w.id, title: w.title, subtitle: "Page Wiki", type: "WIKI" as const, url: `/wiki?pageId=${w.id}`
      })),
      ...items.map(i => ({
        id: i.id, title: i.name, subtitle: `Matériel (${i.status})`, type: "ITEM" as const, url: `/inventory`
      })),
    ];

  } catch (error) {
    console.error("Erreur Recherche Globale:", error);
    return [];
  }

  return results;
}