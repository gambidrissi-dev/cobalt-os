"use client";

import { useState } from 'react';
import { Plus, Search, Calendar, Briefcase, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import Link from 'next/link';
import { createProject } from '../actions'; // On importe l'action serveur

// On définit le type des données qu'on reçoit
type Project = {
  id: number;
  title: string;
  client: string;
  entity: string;
  phase: string;
  progress: number;
  dueDate: string | null;
  color: string;
};

export default function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* MODALE DE CRÉATION CONNECTÉE */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Projet">
        <form action={async (formData) => {
            await createProject(formData); // Appelle le serveur
            setIsModalOpen(false); // Ferme la modale
        }} className="space-y-4">
           
           <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Nom du Projet</label>
              <input name="title" required placeholder="ex: Rénovation Villa M." className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Entité</label>
                <select name="entity" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors">
                   <option value="ARCHI">Cobalt Archi</option>
                   <option value="ATELIER">L'Atelier</option>
                   <option value="SCI">Patrimoine</option>
                   <option value="ASSO">Association</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Client</label>
                <input name="client" required placeholder="ex: M. Martin" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
             </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Date de livraison</label>
              <input name="dueDate" type="date" required className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
           </div>

           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
              Enregistrer en Base de Données
           </button>
        </form>
      </Modal>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Projets</h1>
           <p className="text-gray-500 mt-1">Gestion des chantiers ({initialProjects.length})</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative group flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
              <input type="text" placeholder="Rechercher..." className="w-full bg-[#141416] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white outline-none focus:border-blue-500 transition-all"/>
           </div>
           
           <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
              <Plus size={18} />
              <span className="hidden md:inline">Nouveau</span>
           </button>
        </div>
      </div>

      {/* LISTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialProjects.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-gray-500">Aucun projet trouvé. Créez-en un !</div>
        ) : (
            initialProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block h-full">
                <Card className="group cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 relative overflow-hidden h-full">
                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white ${project.color} rounded-bl-xl shadow-lg`}>
                    {project.entity}
                </div>
                <div className="flex justify-between items-start mb-4">
                    <Badge color="slate">{project.phase}</Badge>
                    <div className="text-gray-600 hover:text-white transition-colors"><MoreHorizontal size={20} /></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6"><Briefcase size={14} />{project.client}</div>
                <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-xs text-gray-400"><span>Progression</span><span>{project.progress}%</span></div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${project.color}`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={14} /> Livraison : {project.dueDate}
                </div>
                </Card>
            </Link>
            ))
        )}
      </div>
    </div>
  );
}