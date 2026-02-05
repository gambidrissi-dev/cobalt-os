import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { findManySafe, countSafe } from "@/app/lib/dal";

// GET /dashboard/me
// Données spécifiques à la micro-entreprise connectée
export async function GET() {
  
  // Utilisation de notre DAL pour garantir que Gambi ne voit que Gambi
  const [myProjects, myPendingInvoicesCount] = await Promise.all([
    findManySafe(prisma.project, {
      where: { status: 'IN_PROGRESS' },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      // ECO-CONCEPTION : Pas de description, pas de blob, juste les titres
      select: { id: true, title: true, progress: true, dueDate: true }
    }),
    countSafe(prisma.invoice, {
      status: 'SENT'
    })
  ]);

  return NextResponse.json({
    widgets: {
      activeProjects: myProjects,
      pendingInvoices: myPendingInvoicesCount
    }
  });
}