"use client";

import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Euro, FileText, CheckCircle, Share2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

// Fake Data pour la démo
const PROJECT_DATA = {
  id: 101,
  title: "Rénovation Hall B",
  client: "Mairie Poitiers",
  status: "En cours",
  progress: 65,
  description: "Rénovation complète du hall d'entrée, mise aux normes PMR et réfection de l'éclairage.",
  budget: { total: 15000, spent: 8450 },
  planning: [
    { phase: "ESQ", status: "Terminé", date: "Nov 2023" },
    { phase: "APS/APD", status: "Terminé", date: "Jan 2024" },
    { phase: "PRO/DCE", status: "En cours", date: "Mars 2024" },
    { phase: "CHANTIER", status: "À venir", date: "Juin 2024" },
  ]
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* NAVIGATION RETOUR */}
      <Link href="/projects" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors w-fit">
        <ArrowLeft size={16} />
        Retour aux projets
      </Link>

      {/* EN-TÊTE PROJET */}
      <div className="bg-[#141416] border border-white/10 rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Badge color="blue">ARCHI</Badge>
               <span className="text-xs text-gray-500 font-mono">#{params.id}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">{PROJECT_DATA.title}</h1>
            <p className="text-gray-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               {PROJECT_DATA.client}
            </p>
          </div>

          <div className="flex gap-3">
             <button className="bg-blue-600/10 text-blue-400 border border-blue-600/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                <Share2 size={16} />
                <span className="hidden md:inline">Espace Client</span>
             </button>
             <button className="p-2 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5">
                <MoreVertical size={20} />
             </button>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-6 border-b border-white/10">
           {['overview', 'planning', 'budget', 'files'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`pb-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                 activeTab === tab 
                 ? 'text-white border-blue-500' 
                 : 'text-gray-500 border-transparent hover:text-gray-300'
               }`}
             >
               {tab === 'overview' ? "Vue d'ensemble" : tab}
             </button>
           ))}
        </div>
      </div>

      {/* CONTENU DES ONGLETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* GAUCHE : INFOS PRINCIPALES */}
         <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                <Card>
                   <h3 className="font-bold text-white mb-4">Description</h3>
                   <p className="text-gray-400 text-sm leading-relaxed">{PROJECT_DATA.description}</p>
                </Card>

                <Card>
                   <h3 className="font-bold text-white mb-4">Chronologie</h3>
                   <div className="space-y-4">
                      {PROJECT_DATA.planning.map((step, i) => (
                        <div key={i} className="flex items-center gap-4 relative">
                           {/* Ligne verticale */}
                           {i !== PROJECT_DATA.planning.length - 1 && (
                              <div className="absolute left-2.5 top-8 bottom-[-16px] w-0.5 bg-white/10"></div>
                           )}
                           
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${step.status === 'Terminé' ? 'bg-green-500 border-green-500' : step.status === 'En cours' ? 'bg-blue-500 border-blue-500' : 'bg-[#141416] border-gray-600'}`}>
                              {step.status === 'Terminé' && <CheckCircle size={10} className="text-[#141416] stroke-[4]" />}
                           </div>
                           
                           <div className="bg-[#1E1E21] border border-white/5 p-3 rounded-xl flex-1 flex justify-between items-center">
                              <span className="text-sm font-bold text-gray-200">{step.phase}</span>
                              <div className="flex items-center gap-3">
                                 <Badge color={step.status === 'Terminé' ? 'green' : step.status === 'En cours' ? 'blue' : 'slate'}>{step.status}</Badge>
                                 <span className="text-xs text-gray-500 font-mono">{step.date}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>
              </>
            )}

            {activeTab === 'budget' && (
               <Card>
                  <div className="text-center py-10">
                     <Euro size={48} className="mx-auto text-gray-600 mb-4" />
                     <p className="text-gray-400">Module Budget en cours de développement...</p>
                  </div>
               </Card>
            )}
         </div>

         {/* DROITE : WIDGETS */}
         <div className="space-y-6">
            <Card>
               <h3 className="font-bold text-white mb-4 text-sm uppercase text-gray-500">Rentabilité</h3>
               <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">{Math.round((PROJECT_DATA.budget.spent / PROJECT_DATA.budget.total) * 100)}%</span>
                  <span className="text-sm text-gray-500 mb-1">consommé</span>
               </div>
               <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-orange-500 w-[56%]"></div>
               </div>
               <div className="flex justify-between text-xs text-gray-400 pt-4 border-t border-white/5">
                  <span>Dépensé : {PROJECT_DATA.budget.spent}€</span>
                  <span>Total : {PROJECT_DATA.budget.total}€</span>
               </div>
            </Card>

            <Card>
               <h3 className="font-bold text-white mb-4 text-sm uppercase text-gray-500">Fichiers Récents</h3>
               <div className="space-y-3">
                  {[1,2,3].map((f) => (
                     <div key={f} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                        <div className="p-2 bg-blue-500/10 rounded text-blue-400"><FileText size={16}/></div>
                        <div className="flex-1 overflow-hidden">
                           <p className="text-sm text-gray-300 truncate group-hover:text-white">Plan_RDC_V3.pdf</p>
                           <p className="text-[10px] text-gray-600">Hier à 14:30</p>
                        </div>
                     </div>
                  ))}
               </div>
               <button className="w-full mt-4 text-xs text-center text-gray-500 hover:text-white transition-colors">Voir tout le dossier</button>
            </Card>
         </div>

      </div>
    </div>
  );
}