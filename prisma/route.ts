import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/services/auth";

// GET /api/v1/status
// Point d'entrée principal pour le Dashboard "OS"
export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Calendrier (Événements partagés + événements perso)
  // Tout le monde voit les événements partagés
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { isShared: true },
        // { userId: user.id } // Si on avait un lien user
      ]
    },
    orderBy: { start: 'asc' },
    take: 10
  });

  // 2. Fichiers Récents (Système de fichiers)
  // On voit ses fichiers + les fichiers publics
  const recentFiles = await prisma.file.findMany({
    where: {
      OR: [
        { isPublic: true },
        { ownerId: user.id }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, size: true, mimeType: true, path: true }
  });

  // 3. Solde & Finance (Logique de Droits Stricte)
  // Seuls les admins (Gambi, Lola, Lou-Ann) voient l'argent.
  const isAdmin = ['admin', 'PRESIDENT', 'DG', 'ASSOCIE'].includes(user.role);
  
  let financialStatus = null;

  if (isAdmin) {
    const [myOrg, collectiveOrg] = await Promise.all([
      prisma.company.findUnique({ where: { id: user.organizationId || '' } }),
      prisma.company.findFirst({ where: { isCollective: true } })
    ]);

    financialStatus = {
      personalBalance: myOrg?.balance || 0,
      collectiveBalance: collectiveOrg?.balance || 0,
      currency: 'EUR'
    };
  }

  return NextResponse.json({
    calendar: events,
    files: recentFiles,
    finance: financialStatus // Sera null si pas admin
  });
}