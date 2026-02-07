import { prisma } from "@/app/lib/prisma";
import { saveScript } from "@/app/actions/media";
import { PenTool, Plus, FileText, MoreHorizontal } from "lucide-react";

export default async function MediaStudioPage() {
  const scripts = await prisma.mediaScript.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { author: true }
  });

  return (
    <div className="space-y-8 fade-in">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <PenTool className="text-pink-500" /> Studio & Scripts
          </h1>
          <p className="text-gray-400">Idéation, brouillons et scripts vidéos.</p>
        </div>
      </div>

      {/* GRILLE DE SCRIPTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARTE "NOUVEAU SCRIPT" (FORMULAIRE) */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between group hover:border-purple-500/50 transition-all">
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="text-purple-400" /> Nouvelle Idée
                </h3>
                <form action={saveScript} className="space-y-3">
                    <input 
                        name="title" 
                        placeholder="Titre du concept..." 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
                    />
                    <textarea 
                        name="content" 
                        placeholder="Détails, hook, notes..." 
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500 resize-none"
                    />
                    <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Créer le brouillon
                    </button>
                </form>
            </div>
        </div>

        {/* LISTE DES SCRIPTS */}
        {scripts.map((script) => (
            <div key={script.id} className="bg-[#141416] p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all flex flex-col h-full group relative cursor-pointer">
                
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-white transition-colors">
                        <FileText size={20} />
                    </div>
                    <button className="text-gray-600 hover:text-white">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{script.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
                    {script.content || "Aucun contenu..."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-white/5 px-2 py-1 rounded">
                        {script.status}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{new Date(script.updatedAt).toLocaleDateString()}</span>
                        <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[8px] text-white font-bold">
                            {script.author.name.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}