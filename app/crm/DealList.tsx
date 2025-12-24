"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { createDeal } from '../actions'; // On appelle ton action serveur

type Deal = {
  id: number;
  title: string;
  client: string;
  value: number;
  stage: string;
  probability: number;
  entity: string;
  color: string;
};

// Les 4 colonnes du Kanban
const STAGES = [
  { id: 'NEW', label: 'Nouvelles Pistes', color: 'border-slate-500' },
  { id: 'CONTACT', label: 'Prise de Contact', color: 'border-blue-500' },
  { id: 'PROPOSAL', label: 'Offre / Devis', color: 'border-purple-500' },
  { id: 'NEGOTIATION', label: 'Négociation', color: 'border-orange-500' },
];

export default function DealList({ deals }: { deals: Deal[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col animate-in fade-in duration-500">
      
      {/* MODALE D'AJOUT */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Opportunité">
        <form action={async (formData) => { await createDeal(formData); setIsModalOpen(false); }} className="space-y-4">
           <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Titre de l'affaire</label>
              <input name="title" required placeholder="ex: Extension École" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Montant Estimé (€)</label>
                <input name="value" type="number" required placeholder="15000" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
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
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Client / Prospect</label>
              <input name="client" required placeholder="ex: Mairie de Bignoux" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
           </div>
           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Créer la piste</button>
        </form>
      </Modal>

      {/* HEADER */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
           <h1 className="text-3xl font-bold text-white">CRM & Opportunités</h1>
           <p className="text-gray-500 mt-1">Suivi commercial ({deals.length} pistes)</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
           <Plus size={18} /> <span>Nouvelle Piste</span>
        </button>
      </div>

      {/* KANBAN BOARD (Colonnes) */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-[1000px] h-full">
           {STAGES.map((stage) => {
             // On filtre les deals pour ne garder que ceux de cette colonne
             const stageDeals = deals.filter(d => d.stage === stage.id);
             
             return (
               <div key={stage.id} className="flex-1 flex flex-col min-w-[280px]">
                  {/* Tête de colonne */}
                  <div className={`border-t-4 ${stage.color} bg-[#141416] p-4 rounded-t-xl flex justify-between items-center mb-4 border-x border-b border-white/5`}>
                     <span className="font-bold text-white text-sm">{stage.label}</span>
                     <span className="text-xs text-gray-500 bg-[#0A0A0C] px-2 py-1 rounded-full border border-white/10">{stageDeals.length}</span>
                  </div>

                  {/* Liste des cartes */}
                  <div className="flex-1 space-y-3">
                     {stageDeals.map((deal) => (
                        <div key={deal.id} className="bg-[#141416] p-4 rounded-xl border border-white/10 hover:border-white/30 cursor-grab active:cursor-grabbing shadow-sm group relative transition-all hover:-translate-y-1">
                           <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${deal.color}`}></div>
                           <h4 className="font-bold text-white text-sm mb-1">{deal.title}</h4>
                           <p className="text-xs text-gray-400 mb-3">{deal.client}</p>
                           <div className="flex justify-between items-center pt-3 border-t border-white/5">
                              <Badge color="slate">{deal.value.toLocaleString()} €</Badge>
                              <span className="text-[10px] text-gray-500 font-bold">{deal.probability}%</span>
                           </div>
                        </div>
                     ))}
                     
                     {/* Message si colonne vide */}
                     {stageDeals.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-xs text-gray-600">Vide</div>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}