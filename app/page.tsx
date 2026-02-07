import { prisma } from "@/app/lib/prisma";
import { getActiveEntity, getCurrentUser } from "@/app/actions/auth";
import Link from "next/link";
import { ArrowUpRight, Users, Clock, CreditCard, TrendingUp, Activity, AlertCircle } from "lucide-react";

export default async function Dashboard() {
  const entity = await getActiveEntity();
  const user = await getCurrentUser();
  const firstName = user ? user.name.split(' ')[0] : "l'Équipe"; 
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);

  const [projects, invoicesThisMonth, pendingInvoices, todaysLogs, activeUsers] = await Promise.all([
    prisma.project.findMany({ where: { entity: entity === 'GLOBAL' ? {} : entity, status: 'IN_PROGRESS' }, take: 4, orderBy: { updatedAt: 'desc' } }),
    prisma.invoice.findMany({ where: { entity: entity === 'GLOBAL' ? {} : entity, createdAt: { gte: firstDayOfMonth } } }),
    prisma.invoice.findMany({ where: { entity: entity === 'GLOBAL' ? {} : entity, status: 'PENDING' }, include: { client: true }, take: 3 }),
    prisma.timeLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } }, include: { user: true } }),
    prisma.user.count()
  ]);

  const currentRevenue = invoicesThisMonth.reduce((acc, inv) => acc + inv.totalHT, 0);
  const pendingRevenue = pendingInvoices.reduce((acc, inv) => acc + inv.totalHT, 0);
  const activeUserIds = new Set(todaysLogs.map(log => log.userId));

  return (
    <div className="space-y-8 fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{firstName}</span> 👋</h1>
          <p className="text-gray-400">Voici ce qui se passe aujourd'hui chez {entity === 'GLOBAL' ? 'Collectif Cobalt' : entity}.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={40} className="text-green-500" /></div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Production (Ce mois)</p>
           <h3 className="text-2xl font-black text-white">{currentRevenue.toLocaleString()} €</h3>
        </div>
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CreditCard size={40} className="text-orange-500" /></div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">En attente paiement</p>
           <h3 className="text-2xl font-black text-white">{pendingRevenue.toLocaleString()} €</h3>
        </div>
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={40} className="text-blue-500" /></div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Actifs Aujourd'hui</p>
           <h3 className="text-2xl font-black text-white">{activeUserIds.size} <span className="text-sm text-gray-500 font-medium">/ {activeUsers}</span></h3>
        </div>
        <div className="p-5 bg-gradient-to-br from-indigo-900/50 to-[#141416] border border-indigo-500/20 rounded-2xl relative overflow-hidden">
           <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider mb-1">Projets en cours</p>
           <h3 className="text-2xl font-black text-white">{projects.length}</h3>
           <Link href="/projects" className="absolute bottom-5 right-5 text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">Voir tout</Link>
        </div>
      </div>
    </div>
  );
}
