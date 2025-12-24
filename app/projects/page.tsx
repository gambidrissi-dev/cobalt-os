import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { Plus, Briefcase, Building } from "lucide-react";

// --- ACTION SERVEUR ---
async function createProject(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const value = parseFloat(formData.get("value") as string) || 0;
  const type = formData.get("type") as string; // <--- ON RÉCUPÈRE LE TYPE ICI

  if (!title) return;

  await prisma.project.create({
    data: {
      title,
      value,
      type: type || "media", // <--- ON L'ENVOIE À LA BDD (par défaut 'media')
      status: "TODO",
    },
  });
  
  revalidatePath("/projects");
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany();

  // On trie les projets par statut
  const todo = projects.filter((p) => p.status === "TODO");
  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS");
  const done = projects.filter((p) => p.status === "DONE");

  return (
    <div className="space-y-8 fade-in">
      
      {/* EN-TÊTE + FORMULAIRE */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projets</h1>
          <p className="text-gray-400">Suivi des missions Média & Archi</p>
        </div>

        {/* --- FORMULAIRE RÉPARÉ --- */}
        <div className="bg-[#141416] p-2 rounded-xl border border-white/10 w-full xl:w-auto">
            <form action={createProject} className="flex flex-col md:flex-row gap-2">
            
            {/* Input Titre */}
            <input 
                name="title" 
                type="text" 
                placeholder="Nom du projet..." 
                required
                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none w-full md:w-48"
            />

            {/* Input Prix */}
            <input 
                name="value" 
                type="number" 
                placeholder="Prix €" 
                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none w-full md:w-24"
            />

            {/* Select Type (NOUVEAU) */}
            <select name="type" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none cursor-pointer">
                <option value="media" className="bg-black text-white">Média</option>
                <option value="archi" className="bg-black text-white">Archi</option>
            </select>

            {/* Bouton */}
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter
            </button>
            </form>
        </div>
        {/* ------------------------- */}
      </div>

      {/* LE KANBAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLONNE 1 : À FAIRE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-gray-400 font-medium px-2 uppercase text-xs tracking-wider">
            <span>À faire</span>
            <span className="bg-white/10 text-[10px] px-2 py-1 rounded-full text-white">{todo.length}</span>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {todo.map((p) => <ProjectCard key={p.id} project={p} color="border-l-gray-500" />)}
            {todo.length === 0 && <EmptyState />}
          </div>
        </div>

        {/* COLONNE 2 : EN COURS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-blue-400 font-medium px-2 uppercase text-xs tracking-wider">
            <span>En cours</span>
            <span className="bg-blue-500/10 text-[10px] px-2 py-1 rounded-full text-blue-400">{inProgress.length}</span>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {inProgress.map((p) => <ProjectCard key={p.id} project={p} color="border-l-blue-500" />)}
             {inProgress.length === 0 && <EmptyState />}
          </div>
        </div>

        {/* COLONNE 3 : TERMINÉ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-emerald-400 font-medium px-2 uppercase text-xs tracking-wider">
            <span>Terminé</span>
            <span className="bg-emerald-500/10 text-[10px] px-2 py-1 rounded-full text-emerald-400">{done.length}</span>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {done.map((p) => <ProjectCard key={p.id} project={p} color="border-l-emerald-500" />)}
             {done.length === 0 && <EmptyState />}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- CARTE PROJET ---
function ProjectCard({ project, color }: { project: any, color: string }) {
  return (
    <div className={`bg-[#141416] p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all group ${color} border-l-4 shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        {/* Badge Type */}
        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
            project.type === 'archi' 
            ? 'text-orange-400 border-orange-400/20 bg-orange-400/10' 
            : 'text-purple-400 border-purple-400/20 bg-purple-400/10'
        }`}>
            {project.type === 'archi' ? 'Archi' : 'Média'}
        </span>
        <span className="text-sm font-bold text-white">{project.value.toLocaleString()} €</span>
      </div>
      
      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors leading-tight">
        {project.title}
      </h3>
      
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
        <span className="text-[10px] text-gray-500 font-mono">#{project.id.slice(-4)}</span>
        {/* On pourra ajouter la date ici plus tard */}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-24 rounded-xl border border-dashed border-white/5 bg-white/[0.02] flex items-center justify-center text-gray-600 text-xs">
      Aucun projet
    </div>
  );
}