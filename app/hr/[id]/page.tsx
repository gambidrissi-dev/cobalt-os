import { prisma } from "@/app/lib/prisma"; // <--- CORRECTION ICI
import { updateUser } from "@/app/actions/hr";
import Link from "next/link";
import { ArrowLeft, Save, Crown, Briefcase, ChevronDown } from "lucide-react";

const RANKS: Record<string, { label: string }> = {
  PRESIDENT: { label: "Président" },
  DG: { label: "Directeur Général" },
  ASSOCIE: { label: "Associé" },
  SALARIE: { label: "Salarié / Collab" },
  STAGIAIRE: { label: "Stagiaire" },
};

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) return <div className="p-10 text-white">Utilisateur introuvable</div>;

  const hasAccess = (entity: string) => user.allowedEntities.split(',').includes(entity);

  return (
    <div className="max-w-2xl mx-auto fade-in pt-10 pb-20">
      
      <Link href="/hr" className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm font-bold">
        <ArrowLeft size={16}/> Retour à l'organigramme
      </Link>

      <div className="bg-[#141416] p-8 rounded-2xl border border-white/10 shadow-2xl">
        
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
           <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-3xl font-black text-white border-4 border-[#141416] shadow-lg">
             {user.name.charAt(0)}
           </div>
           <div>
             <h1 className="text-2xl font-bold text-white">Modifier le profil</h1>
             <p className="text-gray-400">Mise à jour des informations et des accès.</p>
           </div>
        </div>

        <form action={updateUser} className="space-y-8">
          <input type="hidden" name="id" value={user.id} />

          {/* 1. IDENTITÉ */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full"/> Identité
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Nom complet</label>
                <input name="name" defaultValue={user.name} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Email (Connexion)</label>
                <input name="email" defaultValue={user.email} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
          </section>

          {/* 2. POSTE & HIÉRARCHIE */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Crown size={12} className="text-yellow-500"/> Poste & Statut
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
               <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-yellow-500">Titre (Prestige)</label>
                <input 
                  name="title" 
                  defaultValue={user.title || ""} 
                  placeholder="Ex: Fondateur, Associé..." 
                  className="w-full bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-yellow-500 font-bold text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-yellow-500/30" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-blue-400">Métier (Compétence)</label>
                <input 
                  name="job" 
                  defaultValue={user.job} 
                  placeholder="Ex: Architecte DE" 
                  className="w-full bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-blue-400 font-medium text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-blue-500/30" 
                />
              </div>
              
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-gray-500">Position Hiérarchique</label>
                <div className="relative">
                  <select name="role" defaultValue={user.role} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-white/30 appearance-none cursor-pointer">
                    {Object.entries(RANKS).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={14} />
                </div>
              </div>

            </div>
          </section>

          {/* 3. ACCÈS DONNÉES */}
          <section className="space-y-4 pt-4 border-t border-white/5">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <Briefcase size={12}/> Permissions & Accès
             </h3>
             
             <div className="grid grid-cols-1 gap-2">
                
                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                  <input type="checkbox" name="entities" value="GLOBAL" defaultChecked={hasAccess('GLOBAL')} className="accent-white scale-110"/> 
                  <div>
                    <span className="block text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Collectif Cobalt (Global)</span>
                    <span className="text-[10px] text-gray-500">Accès au Dashboard principal et à la vue d'ensemble.</span>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-3 bg-blue-900/10 rounded-xl border border-blue-500/20 cursor-pointer hover:bg-blue-900/20 transition-colors">
                    <input type="checkbox" name="entities" value="ARCHI" defaultChecked={hasAccess('ARCHI')} className="accent-blue-500 scale-110"/> 
                    <span className="text-sm font-bold text-blue-400">Cobalt + (Archi)</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-orange-900/10 rounded-xl border border-orange-500/20 cursor-pointer hover:bg-orange-900/20 transition-colors">
                    <input type="checkbox" name="entities" value="ATELIER" defaultChecked={hasAccess('ATELIER')} className="accent-orange-500 scale-110"/> 
                    <span className="text-sm font-bold text-orange-400">L'Atelier</span>
                  </label>
                </div>

             </div>
          </section>

          <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.01] shadow-xl flex items-center justify-center gap-2 mt-4">
            <Save size={18}/> Enregistrer les modifications
          </button>

        </form>
      </div>
    </div>
  );
}