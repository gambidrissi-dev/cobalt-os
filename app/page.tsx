import { prisma } from "@/app/lib/prisma";
import { getActiveEntity, getCurrentUser } from "@/app/actions/auth"; // <--- 1. IMPORT getCurrentUser
import Link from "next/link";
import { 
  ArrowUpRight, Users, Clock, CreditCard, 
  TrendingUp, Activity, AlertCircle 
} from "lucide-react";

export default async function Dashboard() {
  const entity = await getActiveEntity();
  
  // --- 2. RÉCUPÉRATION DE L'UTILISATEUR CONNECTÉ ---
  const user = await getCurrentUser();
  // On prend juste le prénom (ce qui est avant l'espace) ou "l'Équipe" par défaut
  const firstName = user ? user.name.split(' ')[0] : "l'Équipe"; 

  // 1. DATES 
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);

  // 2. REQUÊTES PARALLÈLES
  const [
    projects,
    invoicesThisMonth,
    pendingInvoices,
    todaysLogs,
    activeUsers
  ] = await Promise.all([
    // A. Projets
    prisma.project.findMany({
      where: { 
        entity: entity === 'GLOBAL' ? {} : entity,
        status: 'IN_PROGRESS' 
      },
      take: 4,
      orderBy: { updatedAt: 'desc' }
    }),

    // B. CA du mois
    prisma.invoice.findMany({
      where: {
        entity: entity === 'GLOBAL' ? {} : entity,
        createdAt: { gte: firstDayOfMonth }
      }
    }),

    // C. Factures en attente
    prisma.invoice.findMany({
      where: {
        entity: entity === 'GLOBAL' ? {} : entity,
        status: 'PENDING'
      },
      include: { client: true },
      take: 3
    }),

    // D. Pointages du jour
    prisma.timeLog.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: { user: true }
    }),

    // E. Total membres
    prisma.user.count()
  ]);

  // 3. CALCULS DES KPI
  const currentRevenue = invoicesThisMonth.reduce((acc, inv) => acc + inv.totalHT, 0);
  const pendingRevenue = pendingInvoices.reduce((acc, inv) => acc + inv.totalHT, 0);
  const activeUserIds = new Set(todaysLogs.map(log => log.userId));

  return (
    <div className="space-y-8 fade-in pb-10">
      
      {/* HEADER WELCOME PERSONNALISÉ */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{firstName}</span> 👋
          </h1>
          <p className="text-gray-400">Voici ce qui se passe aujourd'hui chez {entity === 'GLOBAL' ? 'Collectif Cobalt' : entity}.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
           <span className="text-xs font-bold text-gray-300">Système Opérationnel</span>
        </div>
      </div>

      {/* 1. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CA MENSUEL */}
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={40} className="text-green-500" />
           </div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Production (Ce mois)</p>
           <h3 className="text-2xl font-black text-white">{currentRevenue.toLocaleString()} €</h3>
           <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
             <ArrowUpRight size={12}/> Sur factures émises
           </p>
        </div>

        {/* TRÉSORERIE DEHORS */}
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard size={40} className="text-orange-500" />
           </div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">En attente paiement</p>
           <h3 className="text-2xl font-black text-white">{pendingRevenue.toLocaleString()} €</h3>
           <p className="text-xs text-orange-500 font-bold mt-2">
             {pendingInvoices.length} factures non réglées
           </p>
        </div>

        {/* ACTIVITÉ RH */}
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={40} className="text-blue-500" />
           </div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Actifs Aujourd'hui</p>
           <h3 className="text-2xl font-black text-white">{activeUserIds.size} <span className="text-sm text-gray-500 font-medium">/ {activeUsers}</span></h3>
           <div className="flex -space-x-2 mt-3">
             {Array.from(activeUserIds).slice(0, 5).map((uid, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-[#141416]"/>
             ))}
           </div>
        </div>

        {/* PROJETS ACTIFS */}
        <div className="p-5 bg-gradient-to-br from-indigo-900/50 to-[#141416] border border-indigo-500/20 rounded-2xl relative overflow-hidden">
           <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider mb-1">Projets en cours</p>
           <h3 className="text-2xl font-black text-white">{projects.length}</h3>
           <Link href="/projects" className="absolute bottom-5 right-5 text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">
             Voir tout
           </Link>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. DERNIERS PROJETS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="font-bold text-white flex items-center gap-2"><Activity size={16} className="text-gray-500"/> Activité Récente</h3>
          </div>
          
          <div className="bg-[#141416] border border-white/5 rounded-2xl overflow-hidden">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border-b border-white/5 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${
                    project.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}/>
                  <div>
                    <h4 className="font-bold text-white">{project.title}</h4>
                    <p className="text-xs text-gray-500">{project.clientName} • {project.entity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300 border border-white/5">
                    {project.phase || 'En cours'}
                  </span>
                </div>
              </div>
            ))}
            {projects.length === 0 && <div className="p-8 text-center text-gray-500 italic">Aucun projet actif.</div>}
          </div>
        </div>

        {/* 3. ALERTE FACTURATION */}
        <div className="space-y-4">
           <div className="flex justify-between items-end px-1">
            <h3 className="font-bold text-white flex items-center gap-2"><AlertCircle size={16} className="text-orange-500"/> Relances à faire</h3>
          </div>

          <div className="bg-[#141416] border border-white/5 rounded-2xl overflow-hidden p-1">
             {pendingInvoices.length > 0 ? pendingInvoices.map((inv) => (
               <Link key={inv.id} href={`/invoices/${inv.id}`} className="block p-3 hover:bg-white/5 rounded-xl transition-colors mb-1">
                 <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-bold text-gray-400">{inv.number}</span>
                    <span className="text-xs font-bold text-white">{inv.totalHT.toLocaleString()} €</span>
                 </div>
                 <p className="text-xs text-gray-500 truncate">{inv.client.name}</p>
                 <p className="text-[10px] text-red-400 mt-1 font-medium">
                   Échéance : {new Date(inv.dueDate).toLocaleDateString()}
                 </p>
               </Link>
             )) : (
               <div className="p-6 text-center">
                 <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                   <CreditCard size={18} className="text-green-500"/>
                 </div>
                 <p className="text-xs text-gray-400">Aucune facture en retard. Tout est clean ! ✨</p>
               </div>
             )}
          </div>

          {/* RACCOURCIS RAPIDES */}
          <div className="grid grid-cols-2 gap-2 mt-4">
             <Link href="/invoices/new" className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-center transition-colors">
               <CreditCard size={20} className="mx-auto mb-2 text-gray-400"/>
               <p className="text-[10px] font-bold text-gray-300">Facturer</p>
             </Link>
             <Link href="/timesheet" className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-center transition-colors">
               <Clock size={20} className="mx-auto mb-2 text-gray-400"/>
               <p className="text-[10px] font-bold text-gray-300">Saisir Temps</p>
             </Link>
          </div>
        </div>

      </div>
    </div>
  );
}