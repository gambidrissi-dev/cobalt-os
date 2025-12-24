import { prisma } from "../lib/prisma";
import { createUser } from "@/app/actions"; // Import de l'action
import { UserPlus, Mail, Shield, User as UserIcon } from "lucide-react";

export default async function HRPage() {
  const team = await prisma.user.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="space-y-8 fade-in">
      <div>
         <h1 className="text-3xl font-bold text-white tracking-tight">Ressources Humaines</h1>
         <p className="text-gray-400">Gestion de l'équipe</p>
      </div>

      {/* --- FORMULAIRE AJOUT MEMBRE --- */}
      <div className="bg-[#141416] p-4 rounded-xl border border-white/10">
        <form action={createUser} className="flex flex-col md:flex-row gap-3">
          <input name="name" type="text" placeholder="Prénom Nom" required className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none flex-1" />
          <input name="email" type="email" placeholder="Email pro" required className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none flex-1" />
          <select name="role" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
            <option value="membre" className="bg-black">Membre</option>
            <option value="admin" className="bg-black">Admin</option>
          </select>
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            + Ajouter
          </button>
        </form>
      </div>
      {/* ------------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((user) => (
          <div key={user.id} className="bg-[#141416] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.name.charAt(0)}
               </div>
               <div>
                  <h3 className="font-bold text-white text-lg">{user.name}</h3>
                  <span className="text-xs text-gray-400 capitalize">{user.role}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}