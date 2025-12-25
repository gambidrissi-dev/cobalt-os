import { prisma } from "../lib/prisma";
import { createWikiPage, updateWikiPage, deleteWikiPage } from "@/app/actions/wiki";
import Link from "next/link";
import { 
  BookOpen, Plus, FileText, Save, Trash2, 
  ArrowLeft, Edit3, Monitor 
} from "lucide-react";

export default async function WikiPage({ searchParams }: { searchParams: Promise<{ pageId?: string; edit?: string }> }) {
  const { pageId, edit } = await searchParams;

  // 1. Récupérer toutes les pages pour la sidebar
  const pages = await prisma.wikiPage.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { project: true } // Pour afficher le nom du projet lié
  });

  // 2. Récupérer la page active (si sélectionnée)
  const activePage = pageId ? await prisma.wikiPage.findUnique({ where: { id: pageId } }) : null;
  
  // Est-on en mode édition ?
  const isEditing = edit === 'true';

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden fade-in">
      
      {/* --- SIDEBAR GAUCHE (Liste) --- */}
      <div className="w-80 bg-[#0A0A0C] border-r border-white/5 flex flex-col">
        
        {/* Header Sidebar */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-1">
            <BookOpen className="text-yellow-500" size={20} /> Savoir
          </h1>
          <p className="text-xs text-gray-500">Base de connaissance</p>
        </div>

        {/* Liste des pages */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {pages.map(page => (
             <Link 
               key={page.id} 
               href={`/wiki?pageId=${page.id}`}
               className={`group flex flex-col p-3 rounded-lg transition-colors ${
                 activePage?.id === page.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
               }`}
             >
               <span className="text-sm font-bold truncate flex items-center gap-2">
                 <FileText size={14} className="opacity-50"/> {page.title}
               </span>
               {page.project && (
                 <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded w-fit mt-1 border border-white/5">
                   {page.project.title}
                 </span>
               )}
             </Link>
           ))}
        </div>

        {/* Formulaire création rapide (Footer Sidebar) */}
        <div className="p-4 border-t border-white/5 bg-[#141416]">
          <form action={createWikiPage} className="flex gap-2">
            <input 
              name="title" 
              placeholder="+ Nouvelle page..." 
              className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-yellow-500"
              required
            />
            <button className="bg-white text-black p-1.5 rounded hover:bg-gray-200">
              <Plus size={14}/>
            </button>
          </form>
        </div>
      </div>


      {/* --- CONTENU DROITE (Reader / Editor) --- */}
      <div className="flex-1 bg-[#050505] flex flex-col relative overflow-hidden">
        
        {activePage ? (
          <>
            {/* Header Contenu */}
            <div className="h-16 border-b border-white/5 flex justify-between items-center px-8 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-10">
               <div>
                 <h2 className="text-2xl font-black text-white">{activePage.title}</h2>
                 <p className="text-[10px] text-gray-500">Dernière mise à jour : {new Date(activePage.updatedAt).toLocaleDateString()}</p>
               </div>
               
               <div className="flex items-center gap-2">
                 {isEditing ? (
                   // Bouton Voir (Quitter édition)
                   <Link href={`/wiki?pageId=${activePage.id}`} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2">
                      <Monitor size={14}/> Lecture
                   </Link>
                 ) : (
                   // Bouton Modifier
                   <Link href={`/wiki?pageId=${activePage.id}&edit=true`} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-500 hover:bg-yellow-500/20 flex items-center gap-2">
                      <Edit3 size={14}/> Modifier
                   </Link>
                 )}
                 
                 <form action={deleteWikiPage.bind(null, activePage.id)}>
                    <button className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16}/>
                    </button>
                 </form>
               </div>
            </div>

            {/* Zone de Contenu */}
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
              
              {isEditing ? (
                // --- MODE ÉDITEUR ---
                <form action={updateWikiPage} className="h-full flex flex-col gap-4">
                  <input type="hidden" name="pageId" value={activePage.id} />
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-start gap-3">
                    <div className="mt-1"><span className="animate-pulse">🟠</span></div>
                    <div>
                      <p className="text-xs font-bold text-yellow-500 mb-1">Mode Édition HTML Brut</p>
                      <p className="text-[10px] text-gray-400">Vous pouvez utiliser des balises HTML (&lt;h1&gt;, &lt;b&gt;, &lt;ul&gt;...) pour formater.</p>
                    </div>
                  </div>
                  
                  <textarea 
                    name="content" 
                    defaultValue={activePage.content}
                    className="flex-1 w-full bg-[#141416] border border-white/10 rounded-xl p-6 text-gray-300 font-mono text-sm leading-relaxed outline-none focus:border-yellow-500/50 resize-none"
                    placeholder="Écrivez votre contenu ici..."
                  />
                  
                  <button type="submit" className="self-end px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 flex items-center gap-2">
                    <Save size={16}/> Enregistrer
                  </button>
                </form>

              ) : (
                // --- MODE LECTURE ---
                // On utilise dangerouslySetInnerHTML pour afficher le HTML stocké
                <article 
                  className="prose prose-invert prose-headings:font-black prose-p:text-gray-400 prose-a:text-yellow-500 max-w-none"
                  dangerouslySetInnerHTML={{ __html: activePage.content }}
                />
              )}
              
            </div>
          </>
        ) : (
          // --- ÉTAT VIDE (Aucune page sélectionnée) ---
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <BookOpen size={48} className="mb-4 opacity-20"/>
            <p className="text-sm font-medium">Sélectionnez une page pour la lire</p>
            <p className="text-xs">ou créez-en une nouvelle dans le menu.</p>
          </div>
        )}

      </div>
    </div>
  );
}