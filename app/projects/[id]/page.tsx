import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { addTask, toggleTask, deleteTask, updateProjectStatus } from "@/app/actions/project";
import { 
  ArrowLeft, CheckCircle2, Circle, Clock, 
  CreditCard, FileText, MoreHorizontal, Plus, Trash2, User 
} from "lucide-react";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Récupération complète des données du projet
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: 'desc' }, include: { user: true } }, // Tâches
      invoices: true,  // Factures pour le CA
      timeLogs: true,  // Temps pour la rentabilité
      wikiPages: true  // Docs
    }
  });

  if (!project) notFound();

  // 2. Calculs Financiers & Temps
  const totalInvoiced = project.invoices.reduce((acc, inv) => acc + inv.totalHT, 0);
  const totalHours = project.timeLogs.reduce((acc, log) => acc + log.duration, 0);
  const progressPercent = project.budget > 0 ? (totalInvoiced / project.budget) * 100 : 0;

  // Helper pour affichage propre (ex: 10.5 -> 10h30)
  const formatHours = (val: number) => {
    let h = Math.floor(val);
    let m = Math.round((val - h) * 60);
    if (m === 60) { h++; m = 0; }
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  };

  // Récupérer les users pour l'assignation des tâches (simplifié)
  const users = await prisma.user.findMany();

  return (
    <div className="space-y-8 fade-in pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <Link href="/projects" className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 mb-2 transition-colors">
             <ArrowLeft size={12}/> Retour aux projets
           </Link>
           <h1 className="text-4xl font-black text-white tracking-tighter mb-1">{project.title}</h1>
           <div className="flex items-center gap-3 text-sm text-gray-400">
             <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-bold text-white border border-white/5 uppercase">{project.entity}</span>
             <span>{project.clientName}</span>
             <span>•</span>
             <span>Phase : {project.phase || "Non définie"}</span>
           </div>
        </div>

        {/* KPI Rapides */}
        <div className="flex gap-4">
          <div className="text-right">
             <p className="text-[10px] uppercase font-bold text-gray-500">Budget</p>
             <p className="text-xl font-bold text-white">{project.budget.toLocaleString()} €</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] uppercase font-bold text-gray-500">Facturé</p>
             <p className={`text-xl font-bold ${totalInvoiced > project.budget ? 'text-green-500' : 'text-blue-400'}`}>
               {totalInvoiced.toLocaleString()} €
             </p>
          </div>
        </div>
      </div>

      {/* BARRE DE PROGRESSION BUDGET */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-green-400" 
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLONNE GAUCHE : TÂCHES (2/3) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Formulaire ajout tâche */}
          <div className="bg-[#141416] p-4 rounded-xl border border-white/10">
            <form action={addTask} className="flex gap-2">
               <input type="hidden" name="projectId" value={project.id} />
               <div className="flex-1 relative">
                 <input 
                   name="title" 
                   placeholder="Ajouter une tâche à faire..." 
                   required
                   className="w-full bg-transparent text-white placeholder:text-gray-600 outline-none h-full pl-2"
                 />
               </div>
               <select name="userId" className="bg-black/40 text-xs text-gray-400 border border-white/10 rounded px-2 outline-none">
                 <option value="">Non assigné</option>
                 {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
               </select>
               <button type="submit" className="bg-white text-black p-2 rounded-lg hover:bg-gray-200">
                 <Plus size={16}/>
               </button>
            </form>
          </div>

          {/* Liste des tâches */}
          <div className="space-y-2">
             {project.tasks.map(task => (
               <div key={task.id} className="group flex items-center gap-3 p-3 bg-[#141416] border border-white/5 hover:border-white/20 rounded-xl transition-all">
                  {/* Checkbox (Formulaire invisible) */}
                  <form action={toggleTask.bind(null, task.id, task.done, project.id)}>
                    <button className={`mt-1 transition-colors ${task.done ? 'text-green-500' : 'text-gray-600 hover:text-white'}`}>
                      {task.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                  </form>
                  
                  <div className={`flex-1 ${task.done ? 'opacity-40 line-through' : ''}`}>
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    {task.user && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">
                          {task.user.name.charAt(0)}
                        </div>
                        <span className="text-[10px] text-gray-500">{task.user.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Supprimer */}
                  <form action={deleteTask.bind(null, task.id, project.id)}>
                    <button className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                      <Trash2 size={14}/>
                    </button>
                  </form>
               </div>
             ))}
             {project.tasks.length === 0 && (
               <div className="text-center py-10 text-gray-500 italic text-sm">
                 Rien à faire pour le moment. Profitez-en ! 🏖️
               </div>
             )}
          </div>
        </div>

        {/* --- COLONNE DROITE : INFOS & DOCS (1/3) --- */}
        <div className="space-y-6">
          
          {/* Carte TEMPS */}
          <div className="bg-[#141416] p-5 rounded-2xl border border-white/5">
             <div className="flex items-center gap-2 mb-4 text-pink-500">
               <Clock size={18}/> <h3 className="font-bold text-white">Temps passé</h3>
             </div>
             <p className="text-3xl font-black text-white mb-1">{formatHours(totalHours)}</p>
             <p className="text-xs text-gray-500">
               Soit environ <span className="text-white font-bold">{Math.round(totalHours / 8)} jours</span> de travail.
             </p>
             <div className="mt-4 pt-4 border-t border-white/5">
               <Link href="/timesheet" className="text-xs font-bold text-gray-400 hover:text-white flex items-center justify-between">
                 Saisir des heures <ArrowLeft className="rotate-180" size={12}/>
               </Link>
             </div>
          </div>

          {/* Carte FACTURES */}
          <div className="bg-[#141416] p-5 rounded-2xl border border-white/5">
             <div className="flex items-center gap-2 mb-4 text-green-500">
               <CreditCard size={18}/> <h3 className="font-bold text-white">Facturation</h3>
             </div>
             <div className="space-y-2">
               {project.invoices.map(inv => (
                 <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex justify-between items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-xs">
                   <span className="text-gray-300 font-mono">{inv.number}</span>
                   <span className="font-bold text-white">{inv.totalHT.toLocaleString()} €</span>
                 </Link>
               ))}
               {project.invoices.length === 0 && <p className="text-xs text-gray-500 italic">Aucune facture émise.</p>}
             </div>
             <div className="mt-4 pt-4 border-t border-white/5">
               <Link href="/invoices/new" className="text-xs font-bold text-gray-400 hover:text-white flex items-center justify-between">
                 Créer une facture <Plus size={12}/>
               </Link>
             </div>
          </div>

          {/* Carte DOCS / WIKI */}
          <div className="bg-[#141416] p-5 rounded-2xl border border-white/5">
             <div className="flex items-center gap-2 mb-4 text-yellow-500">
               <FileText size={18}/> <h3 className="font-bold text-white">Documents</h3>
             </div>
             <div className="space-y-2">
               {project.wikiPages.map(page => (
                 <Link key={page.id} href={`/wiki?pageId=${page.id}`} className="block text-sm text-gray-300 hover:text-white hover:underline truncate">
                   📄 {page.title}
                 </Link>
               ))}
               {project.wikiPages.length === 0 && <p className="text-xs text-gray-500 italic">Aucune page wiki liée.</p>}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}