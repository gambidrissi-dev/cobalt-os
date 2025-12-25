import { prisma } from "@/app/lib/prisma";
import { loginAction, createFirstAdmin } from "@/app/actions/auth"; // <--- Import createFirstAdmin
import { Lock, ArrowRight, Hexagon, UserPlus } from "lucide-react";

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Fond animé */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px] animate-pulse"/>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] animate-pulse delay-1000"/>
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/20">
            <Hexagon className="text-black fill-black" size={32} />
          </div>
          <div>
             <h1 className="text-4xl font-black text-white tracking-tighter mb-2">COBALT OS</h1>
             <p className="text-gray-400">Système d'exploitation de l'agence.</p>
          </div>
        </div>

        {/* --- CAS 1 : AUCUN UTILISATEUR (SETUP) --- */}
        {users.length === 0 ? (
          <div className="max-w-md mx-auto bg-[#141416] border border-yellow-500/30 p-8 rounded-2xl shadow-2xl">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
               <UserPlus size={24}/>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Bienvenue, Fondateur.</h2>
            <p className="text-sm text-gray-400 mb-6">Aucun membre détecté. Créez le premier compte Administrateur pour initialiser le système.</p>
            
            <form action={createFirstAdmin} className="space-y-4 text-left">
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Votre Nom</label>
                 <input name="name" placeholder="Ex: Gambi" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500"/>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                 <input name="email" type="email" placeholder="admin@cobalt.com" required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500"/>
               </div>
               <button className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
                 Initialiser l'OS
               </button>
            </form>
          </div>
        ) : (
          
          /* --- CAS 2 : LISTE DES UTILISATEURS (NORMAL) --- */
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
              {users.map((user) => (
                <div key={user.id} className="group relative">
                  <label className="cursor-pointer block">
                    <input type="radio" name="selectedUser" className="peer sr-only" />
                    
                    <div className="bg-[#141416] border border-white/10 p-6 rounded-2xl hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center gap-4 peer-checked:border-blue-500 peer-checked:bg-blue-500/10">
                      
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 border border-white/10 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                        {user.name.charAt(0)}
                      </div>
                      
                      <div className="text-center">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.job}</p>
                      </div>

                      {/* Login Form Overlay */}
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all p-4 z-20 border border-white/20">
                        <p className="text-white font-bold mb-3 text-sm">Bonjour {user.name.split(' ')[0]}</p>
                        
                        <form action={loginAction} className="w-full flex flex-col gap-2">
                          <input type="hidden" name="email" value={user.email} />
                          <div className="relative w-full">
                            <Lock size={12} className="absolute left-3 top-3 text-gray-500"/>
                            <input 
                              name="password" 
                              type="password" 
                              placeholder="Mot de passe" 
                              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-8 pr-2 text-xs text-white outline-none focus:border-white/50"
                              autoFocus={false} // Empêche le focus auto qui scrolle
                            />
                          </div>
                          <button className="w-full bg-white text-black font-bold py-2 rounded-lg text-xs hover:bg-gray-200 flex items-center justify-center gap-2">
                            Entrer <ArrowRight size={12}/>
                          </button>
                        </form>
                      </div>

                    </div>
                  </label>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600">
              Mot de passe par défaut : <span className="font-mono text-gray-500">cobalt123</span>
            </p>
          </>
        )}

      </div>
    </div>
  );
}