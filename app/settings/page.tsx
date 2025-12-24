import { prisma } from "../lib/prisma";
import { Settings, Tag, Archive, AlertTriangle, Trash2 } from "lucide-react";
import { ResetButton } from "./ResetButton"; // On va créer ce petit fichier juste après

export default async function SettingsPage() {
  // On récupère le catalogue de services (côté serveur)
  const services = await prisma.service.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8 fade-in">
      
      {/* EN-TÊTE */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-800 rounded-xl">
          <Settings size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Paramètres</h1>
          <p className="text-gray-400">Configuration générale de Cobalt OS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : CATALOGUE (Lecteur Seule ici) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag size={20} className="text-blue-500" /> Catalogue Prestations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.id} className="bg-[#141416] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white">{s.name}</h3>
                  <span className="text-emerald-400 font-mono font-bold">{s.price} €</span>
                </div>
                <div className="flex justify-between items-end mt-2">
                   <span className="text-xs text-gray-500 uppercase tracking-wider">{s.category}</span>
                </div>
              </div>
            ))}
            {services.length === 0 && (
               <p className="text-gray-500 text-sm italic">Aucun service configuré.</p>
            )}
          </div>
        </div>

        {/* COLONNE DROITE : DANGER ZONE */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Archive size={20} className="text-orange-500" /> Système
          </h2>
          
          <div className="bg-[#141416] p-6 rounded-2xl border border-red-900/30 space-y-4">
            <div className="flex items-center gap-3 text-red-400 mb-2">
                <AlertTriangle size={20} />
                <h3 className="font-bold">Zone de Danger</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
                Cette action supprimera toutes les données (Clients, Factures, Projets) pour remettre le logiciel à zéro. Irréversible.
            </p>
            
            {/* Le bouton interactif est ici */}
            <ResetButton />
            
          </div>
        </div>

      </div>
    </div>
  );
}