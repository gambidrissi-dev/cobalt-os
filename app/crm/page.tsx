import { prisma } from "../lib/prisma";
import { createClient, deleteClient } from "@/app/actions"; // On ajoute deleteClient
import { DeleteButton } from "@/components/DeleteButton"; // On importe le bouton
import { Mail, Phone, MapPin, Briefcase, FileText } from "lucide-react";

export default async function CRMPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { projects: true, invoices: true } } }
  });

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Clients</h1>
        <p className="text-gray-400">Répertoire et suivi commercial</p>
      </div>

      {/* AJOUT RAPIDE */}
      <div className="bg-[#141416] p-4 rounded-xl border border-white/10 mb-6">
        <form action={createClient} className="flex flex-col md:flex-row gap-3">
          <input name="name" type="text" placeholder="Nom de l'entreprise" required className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none flex-1" />
          <input name="email" type="email" placeholder="Email contact" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none flex-1" />
          <select name="type" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
            <option value="PME">PME</option>
            <option value="Grand Compte">Grand Compte</option>
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:bg-indigo-700">
            + Créer
          </button>
        </form>
      </div>

      {/* GRILLE DES CLIENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-[#141416] p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group relative">
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/20">
                {client.name.charAt(0)}
              </div>
              
              {/* LA GOMME EST ICI */}
              <DeleteButton id={client.id} action={deleteClient} />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
            
            <div className="space-y-2 mt-4 text-sm text-gray-400">
              {client.email && <div className="flex items-center gap-3"><Mail size={14} /> {client.email}</div>}
              {client.phone && <div className="flex items-center gap-3"><Phone size={14} /> {client.phone}</div>}
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                  <Briefcase size={14} className="text-indigo-400" />
                  {client._count.projects} Projet(s)
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                  <FileText size={14} className="text-emerald-400" />
                  {client._count.invoices} Facture(s)
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}