import { prisma } from "./lib/prisma";
import Link from "next/link";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Activity
} from "lucide-react";

export default async function Home() {
  // 1. Récupération des données réelles depuis la BDD
  
  // Compter les projets qui ne sont pas "Terminés"
  const activeProjects = await prisma.project.count({
    where: {
      status: {
        not: "DONE" 
      }
    }
  });

  // Compter les membres de l'équipe (Table User)
  const teamCount = await prisma.user.count();

  // Calculer le Chiffre d'Affaires (Somme des factures 'PAID')
  // Note: Comme on n'a pas encore de factures payées, ça sera 0, c'est normal.
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: "PAID" }
  });
  
  // On additionne les montants
  const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.totalHT, 0);

  // Pour la trésorerie (en attendant d'avoir des dépenses), on affiche le CA en attente
  const pendingInvoices = await prisma.invoice.findMany({
    where: { status: "SENT" }
  });
  const pendingRevenue = pendingInvoices.reduce((acc, inv) => acc + inv.totalHT, 0);

  return (
    <div className="space-y-8 fade-in">
      
      {/* EN-TÊTE */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Tableau de Bord</h1>
        <p className="text-gray-400 mt-1">Vue d'ensemble et indicateurs clés</p>
      </div>

      {/* CARTES KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARTE 1 : CHIFFRE D'AFFAIRES */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-white/5 relative group hover:border-blue-600/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chiffre d'Affaires</p>
              <h3 className="text-3xl font-bold text-white mt-2">{totalRevenue.toLocaleString()} €</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-1/3"></div>
          </div>
          <Link href="/finance" className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white">
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* CARTE 2 : PROJETS EN COURS */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-white/5 relative group hover:border-emerald-600/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Projets en cours</p>
              <h3 className="text-3xl font-bold text-white mt-2">{activeProjects}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Briefcase size={24} />
            </div>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-2/3"></div>
          </div>
          <Link href="/projects" className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white">
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* CARTE 3 : TRÉSORERIE (EN ATTENTE) */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-white/5 relative group hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">En attente (Factures)</p>
              <h3 className="text-3xl font-bold text-white mt-2">{pendingRevenue.toLocaleString()} €</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Flux financier à venir</p>
        </div>

        {/* CARTE 4 : ÉQUIPE */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-white/5 relative group hover:border-orange-600/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Équipe</p>
              <h3 className="text-3xl font-bold text-white mt-2">{teamCount}</h3>
            </div>
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <div className="flex -space-x-2 mt-2">
            {/* On simule des avatars pour le style, plus tard on affichera les vrais */}
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#141416]"></div>
            <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#141416]"></div>
            <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#141416] flex items-center justify-center text-[10px] text-white font-bold">+</div>
          </div>
        </div>

      </div>

      {/* ZONE CENTRALE (GRAPHIQUE VIDE) */}
      <div className="bg-[#0F0F11] border border-white/5 rounded-3xl h-64 flex flex-col items-center justify-center text-center p-8 border-dashed">
         <Activity className="text-gray-700 w-12 h-12 mb-4" />
         <p className="text-gray-500 font-medium">Le graphique de performance arrivera en V2</p>
      </div>

    </div>
  );
}