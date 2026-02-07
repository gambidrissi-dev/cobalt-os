"use client";
import { useState } from 'react';
import { Plus, Search, Calendar, Briefcase, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import Link from 'next/link';
import { createProject } from '@/app/actions/project';
import { Project } from "@prisma/client";

type ProjectUI = Omit<Project, 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  color?: string;
  phase?: string;
}

export default function ProjectList({ initialProjects, currentEntity }: { initialProjects: ProjectUI[], currentEntity: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ENTITY_COLORS: Record<string, string> = { MEDIA: 'bg-purple-600', ATELIER: 'bg-orange-500', STUDIO: 'bg-emerald-600', ARCHI: 'bg-blue-600' };
  const getColor = (p: ProjectUI) => p.color || ENTITY_COLORS[p.entity] || 'bg-blue-500';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Projet">
        <form action={async (formData) => { await createProject(formData); setIsModalOpen(false); }} className="space-y-4">
           <div><label className="block text-xs font-bold text-gray-500 mb-1">Nom du Projet</label><input name="title" required placeholder="ex: Rénovation Villa M." className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" /></div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Entité</label>
                {currentEntity !== 'GLOBAL' ? (
                    <div className="w-full bg-[#141416] border border-white/10 rounded-lg p-3 text-gray-400 cursor-not-allowed"><input type="hidden" name="entity" value={currentEntity} />{currentEntity} (Verrouillé)</div>
                ) : (
                    <select name="entity" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors">
                        <option value="ARCHI">Micro Gambi</option><option value="ATELIER">Micro Lola</option><option value="STUDIO">Micro Lou-Ann</option><option value="MEDIA">Cobalt Média</option>
                    </select>
                )}
             </div>
             <div><label className="block text-xs font-bold text-gray-500 mb-1">Client</label><input name="clientName" required placeholder="ex: M. Martin" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" /></div>
           </div>
           <div><label className="block text-xs font-bold text-gray-500 mb-1">Date de livraison</label><input name="dueDate" type="date" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" /></div>
           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Enregistrer</button>
        </form>
      </Modal>
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div><h1 className="text-3xl font-bold text-white">Projets</h1><p className="text-gray-500 mt-1">Gestion des chantiers ({initialProjects.length})</p></div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative group flex-1 md:w-64"><Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-white transition-colors" size={18} /><input type="text" placeholder="Rechercher..." className="w-full bg-[#141416] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white outline-none focus:border-blue-500 transition-all"/></div>
           <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"><Plus size={18} /><span className="hidden md:inline">Nouveau</span></button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialProjects.length === 0 ? <div className="col-span-3 text-center py-20 text-gray-500">Aucun projet trouvé. Créez-en un !</div> : initialProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block h-full">
                <Card className="group cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 relative overflow-hidden h-full">
                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white ${getColor(project)} rounded-bl-xl shadow-lg`}>{project.entity}</div>
                <div className="flex justify-between items-start mb-4"><Badge color="slate">{project.phase || "ESQ"}</Badge><div className="text-gray-600 hover:text-white transition-colors"><MoreHorizontal size={20} /></div></div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6"><Briefcase size={14} />{project.clientName}</div>
                <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-xs text-gray-400"><span>Progression</span><span>{project.progress || 0}%</span></div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden"><div className={`h-full ${getColor(project)}`} style={{ width: `${project.progress || 0}%` }}></div></div>
                </div>
                {project.dueDate && <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-600"><Calendar size={14} /> Livraison : {new Date(project.dueDate).toLocaleDateString()}</div>}
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
