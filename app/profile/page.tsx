import { getCurrentUser, updatePasswordAction } from "@/app/actions/auth";
import { User, Lock, Key, Save } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) return <div className="p-10 text-white">Non connecté.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in pt-10">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl border-2 border-white/10">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-400">{user.job} • {user.role}</p>
        </div>
      </div>

      {/* CARTE SÉCURITÉ */}
      <div className="bg-[#141416] p-8 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="text-pink-500" /> Sécurité
        </h2>

        <form action={updatePasswordAction} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Mot de passe actuel</label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-3 text-gray-500"/>
              <input 
                name="currentPassword" 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 text-white text-sm outline-none focus:border-pink-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nouveau mot de passe</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-gray-500"/>
              <input 
                name="newPassword" 
                type="password" 
                placeholder="Nouveau mot de passe secret" 
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 text-white text-sm outline-none focus:border-pink-500"
                required
              />
            </div>
          </div>

          <div className="pt-4">
             <button className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors">
               <Save size={16}/> Mettre à jour
             </button>
          </div>

        </form>
      </div>
      
      <p className="text-center text-xs text-gray-600">
        Si vous oubliez votre mot de passe, un Administrateur devra supprimer et recréer votre compte.
      </p>

    </div>
  );
}