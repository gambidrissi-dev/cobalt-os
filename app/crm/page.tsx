import { prisma } from "../lib/prisma";
import { createClient } from "@/app/actions"; // On importe l'action
import { Building, Mail, Phone, Plus, MapPin, Briefcase, FileText } from "lucide-react";

export default async function CRMPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { projects: true, invoices: true } } }
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Clients</h1>
          <p className="text-gray-400">Répertoire et suivi commercial</p>
        </div>
      </div>

      {/* --- NOUVEAU : FORMULAIRE D'AJOUT RAPIDE --- */}
      <div className="bg-[#141416] p-4 rounded-xl border border-white/10 mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Ajouter un client rapidement</h3>
        <form action={createClient} className="flex flex-col md:flex-row gap-3">
          <input name="name" type="text" placeholder="Nom de l'entreprise" required className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none flex-1" />
          <input name="email" type="email" placeholder="Email contact" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none flex-1" />
          <select name="type" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
            <option value="PME" className="bg-black">PME</option>
            <option value="Grand Compte" className="bg-black">Grand Compte</option>
            <option value="Association" className="bg-black">Association</option>
          </select>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            + Créer
          </button>
        </form>
      </div>
      {/* ------------------------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-[#141416] p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/20">
                {client.name.charAt(0)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 px-2 py-1 rounded-lg border border-white/5">{client.type}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
            <div className="space-y-2 mt-4 text-sm text-gray-400">
              {client.email && <div className="flex items-center gap-3"><Mail size={14} /> {client.email}</div>}
              {client.phone && <div className="flex items-center gap-3"><Phone size={14} /> {client.phone}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}