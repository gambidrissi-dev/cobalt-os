import { prisma } from "../lib/prisma";
import { getActiveEntity } from "../actions/auth";
import { Plus } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link"; // <--- IMPORT AJOUTÉ

// Nouvelle action simplifiée pour la V2
async function createProjectV2(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const clientName = formData.get("clientName") as string;
  const entity = await getActiveEntity();

  if (!title) return;

  await prisma.project.create({
    data: {
      title,
      clientName: clientName || "Client Inconnu",
      entity: entity,
      status: "IN_PROGRESS",
      budget: 0,
    },
  });
  revalidatePath("/projects");
}

export default async function ProjectsPage() {
  const entityStr = await getActiveEntity();
  const whereCondition = entityStr === 'GLOBAL' ? {} : { entity: entityStr };

  const projects = await prisma.project.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projets {entityStr}</h1>
          <p className="text-gray-400">Gestion opérationnelle</p>
        </div>

        <div className="bg-[#141416] p-2 rounded-xl border border-white/10 w-full xl:w-auto">
            <form action={createProjectV2} className="flex flex-col md:flex-row gap-2">
              <input 
                  name="title" 
                  type="text" 
                  placeholder="Nom du projet..." 
                  required
                  className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none w-full md:w-48"
              />
              <input 
                  name="clientName" 
                  type="text" 
                  placeholder="Nom Client" 
                  className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none w-full md:w-32"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Créer
              </button>
            </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">Aucun projet trouvé pour {entityStr}.</div>
        ) : (
            projects.map((project) => (
            // CORRECTION ICI : Link ajouté
            <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <div className="bg-[#141416] p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all h-full">
                    <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold mb-3 ${project.entity === 'ATELIER' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        {project.entity}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{project.clientName}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400 pt-4 border-t border-white/5">
                        <span>Statut: {project.status}</span>
                        <span>Budget: {project.budget} €</span>
                    </div>
                </div>
            </Link>
            ))
        )}
      </div>
    </div>
  );
}