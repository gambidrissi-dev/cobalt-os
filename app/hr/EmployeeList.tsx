"use client";

import { useState } from 'react';
import { UserPlus, Mail, Phone } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { createEmployee } from '../actions'; // On appelle l'action serveur

type Employee = {
  id: number;
  name: string;
  role: string;
  entity: string;
  type: string;
  avatar: string;
  color: string;
};

export default function EmployeeList({ employees }: { employees: Employee[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       
       {/* LA MODALE DE CRÉATION */}
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Collaborateur">
          <form action={async (formData) => { 
              await createEmployee(formData); 
              setIsModalOpen(false); 
          }} className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nom Complet</label>
                <input name="name" required placeholder="ex: Jean Dupont" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Rôle</label>
                <input name="role" required placeholder="ex: Chef de Projet" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Entité</label>
                <select name="entity" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors">
                   <option value="ARCHI">Cobalt Archi</option>
                   <option value="ATELIER">L'Atelier</option>
                   <option value="SCI">Patrimoine</option>
                   <option value="ASSO">Association</option>
                </select>
             </div>
             <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                Ajouter au registre
             </button>
          </form>
       </Modal>

       {/* EN-TÊTE DE PAGE */}
       <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-white">Ressources Humaines</h1>
           <p className="text-gray-500 mt-1">Annuaire et gestion du personnel ({employees.length})</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
           <UserPlus size={18} />
           <span>Nouveau Membre</span>
        </button>
      </div>

      {/* GRILLE DES EMPLOYÉS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {employees.length === 0 ? (
            <div className="col-span-4 text-center py-20 text-gray-500">Aucun membre dans l'équipe. Ajoutez-en un !</div>
         ) : (
            employees.map((emp) => (
                <Card key={emp.id} className="relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${emp.entity === 'ATELIER' ? 'bg-orange-500' : emp.entity === 'ASSO' ? 'bg-cyan-500' : 'bg-blue-500'}`}></div>
                <div className="pl-3">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-full ${emp.color} flex items-center justify-center font-bold text-white text-lg border-2 border-[#141416] shadow-lg`}>
                            {emp.avatar}
                        </div>
                        <Badge color="slate">{emp.type}</Badge>
                    </div>
                    <h3 className="font-bold text-white text-lg">{emp.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{emp.role}</p>
                    <div className="pt-4 border-t border-white/5 flex gap-2">
                        <button className="p-2 bg-[#0A0A0C] rounded-lg text-gray-400 hover:text-white transition-colors flex-1 flex justify-center"><Mail size={16} /></button>
                        <button className="p-2 bg-[#0A0A0C] rounded-lg text-gray-400 hover:text-white transition-colors flex-1 flex justify-center"><Phone size={16} /></button>
                    </div>
                </div>
                </Card>
            ))
         )}
      </div>
    </div>
  );
}