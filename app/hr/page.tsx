import { prisma } from "@/app/lib/prisma";
import { createUser, deleteUser } from "@/app/actions/hr";
import { getCurrentUser } from "@/app/actions/auth"; 
import { Users, UserPlus, Trash2, Edit3, Crown } from "lucide-react"; // AlertTriangle retiré
import Link from "next/link";

const RANKS: Record<string, { label: string, color: string, border: string, rank: number }> = {
  PRESIDENT: { label: "Président", color: "text-yellow-500", border: "border-yellow-500", rank: 1 },
  DG: { label: "Directeur Général", color: "text-orange-500", border: "border-orange-500", rank: 2 },
  ASSOCIE: { label: "Associé", color: "text-purple-500", border: "border-purple-500", rank: 3 },
  SALARIE: { label: "Salarié / Collab", color: "text-blue-400", border: "border-blue-500/30", rank: 4 },
  STAGIAIRE: { label: "Stagiaire", color: "text-green-400", border: "border-green-500/30", rank: 5 },
};

export default async function HRPage() {
  const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
  const currentUser = await getCurrentUser();

  // --- LOGIQUE DE SÉCURITÉ ---
  let myRank = 99;

  if (currentUser) {
    const cleanEmail = currentUser.email.trim().toLowerCase();
    
    // 👑 GOD MODE : Ton email garde les pleins pouvoirs
    if (cleanEmail === "gambi.drissi@icloud.com") {
        myRank = 1;
    } else {
        myRank = RANKS[currentUser.role]?.rank || 99;
    }
  }

  const sortedUsers = users.sort((a, b) => {
    const rankA = RANKS[a.role]?.rank || 99;
    const rankB = RANKS[b.role]?.rank || 99;
    return rankA - rankB;
  });

  const canCreate = myRank <= 2;

  return (
    <div className="space-y-8 fade-in">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="text-blue-500" /> Organigramme
          </h1>
          <p className="text-gray-400">Gestion des talents et de la hiérarchie.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{users.length}</p>
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Effectif</p>
        </div>
      </div>

      {/* FORMULAIRE AJOUT */}
      {canCreate && (
        <div className="bg-[#141416] p-6 rounded-2xl border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus size={16} /> Nouveau Talent
          </h3>
          <form action={createUser} className="flex flex-col xl:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1 w-full">
                <label className="text-[10px] uppercase font-bold text-gray-500">Nom Complet</label>
                <input name="name" placeholder="Ex: Jean Nouvel" required className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="flex-1 space-y-1 w-full">
                <label className="text-[10px] uppercase font-bold text-gray-500">Email</label>
                <input name="email" type="email" placeholder="jean@cobalt.com" required className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="w-40 space-y-1">
                <label className="text-[10px] uppercase font-bold text-yellow-500">Titre</label>
                <input name="title" placeholder="Ex: Fondateur" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500" />
            </div>
            <div className="flex-1 space-y-1 w-full">
                <label className="text-[10px] uppercase font-bold text-blue-400">Métier</label>
                <input name="job" placeholder="Ex: Architecte" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="w-48 space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Hiérarchie</label>
                <select name="role" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500">
                {Object.entries(RANKS).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                ))}
                </select>
            </div>
            <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Accès</label>
                <div className="flex gap-3 items-center h-[38px] px-3 bg-white/5 rounded-lg border border-white/5">
                    <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
                    <input type="checkbox" name="entities" value="ARCHI" defaultChecked className="accent-blue-500"/> Archi
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
                    <input type="checkbox" name="entities" value="ATELIER" className="accent-orange-500"/> Atelier
                    </label>
                </div>
            </div>
            <button type="submit" className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors h-[38px]">
                Ajouter
            </button>
          </form>
        </div>
      )}

      {/* GRILLE UTILISATEURS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedUsers.map((user) => {
          const targetRankConfig = RANKS[user.role] || RANKS.SALARIE;
          const targetRank = targetRankConfig.rank;

          // --- LOGIQUE DE DROITS ---
          let canEdit = false;
          if (myRank === 1) {
            canEdit = true;
          } else if (myRank === 2) {
             if (currentUser?.id === user.id || targetRank > 2) {
               canEdit = true;
             }
          }

          return (
            <div key={user.id} className={`group relative bg-[#141416] rounded-2xl p-6 border transition-all hover:-translate-y-1 ${targetRankConfig.border}`}>
              
              {canEdit && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                    <Link href={`/hr/${user.id}`} className="text-gray-400 hover:text-white p-2 bg-[#141416] hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                        <Edit3 size={14}/>
                    </Link>
                    {currentUser?.id !== user.id && (
                        <form action={deleteUser.bind(null, user.id)}>
                            <button className="text-gray-400 hover:text-red-500 p-2 bg-[#141416] hover:bg-red-500/10 rounded-lg border border-white/10 transition-colors">
                            <Trash2 size={14}/>
                            </button>
                        </form>
                    )}
                  </div>
              )}

              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 border-4 border-[#141416] shadow-xl flex items-center justify-center text-3xl font-black text-white">
                  {user.name.charAt(0)}
                </div>
                {(user.role === 'PRESIDENT' || user.role === 'DG') && (
                  <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#141416] flex items-center justify-center border ${targetRankConfig.border}`}>
                    <Crown size={14} className={targetRankConfig.color} fill="currentColor" />
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-bold text-white text-xl truncate w-full mb-1">{user.name}</h3>
                {user.title && <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">{user.title}</p>}
                <p className="text-sm font-medium text-blue-400 mb-1">{user.job}</p>
                <p className="text-xs text-gray-600 truncate w-full mb-4">{user.email}</p>

                <div className={`inline-block px-3 py-1 rounded-full bg-white/5 border ${targetRankConfig.border} ${targetRankConfig.color} text-[10px] font-bold uppercase tracking-wider`}>
                  {targetRankConfig.label}
                </div>

                <div className="flex justify-center gap-1 mt-3 flex-wrap">
                  {user.allowedEntities.split(',').filter(Boolean).map(e => (
                    <span key={e} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-white/5">
                      {e === 'GLOBAL' ? 'COBALT' : e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}