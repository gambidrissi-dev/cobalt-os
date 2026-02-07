import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getActiveEntity } from "@/app/actions/auth";

// GET /dashboard/global
// Agrège les news du collectif (Projets Média + Chiffres globaux)
export async function GET() {
  const entity = await getActiveEntity();

  // Sécurité : Seul le contexte GLOBAL ou MEDIA peut voir ça
  if (entity !== 'GLOBAL' && entity !== 'MEDIA') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 1. Requêtes parallèles pour la vitesse
  const [totalProjects, totalRevenue, recentMediaProjects] = await Promise.all([
    prisma.project.count(), // Count est très léger en RAM
    prisma.invoice.aggregate({
      _sum: { totalHT: true },
      where: { status: 'PAID' }
    }),
    prisma.project.findMany({
      where: { entity: 'MEDIA' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      // ECO-CONCEPTION : On ne prend que l'essentiel
      select: { id: true, title: true, status: true, clientName: true }
    })
  ]);

  return NextResponse.json({
    kpi: {
      projects: totalProjects,
      revenue: totalRevenue._sum.totalHT || 0,
    },
    news: recentMediaProjects
  });
}