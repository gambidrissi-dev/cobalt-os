"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FolderKanban, Briefcase, 
  DollarSign, Package, BookOpen, ChevronsUpDown,
  Clock, Users, LogOut, Settings 
} from 'lucide-react';
import { useState } from 'react';
import { switchEntityAction, logoutAction } from '@/app/actions/auth'; 

// ... (Garde la constante ENTITIES telle quelle) ...
const ENTITIES = {
  GLOBAL: { label: 'Collectif Cobalt', color: 'bg-gray-100 text-black', border: 'border-gray-500' },
  ARCHI: { label: 'Cobalt +', color: 'bg-blue-600 text-white', border: 'border-blue-600' },
  ATELIER: { label: "L'Atelier de Cobalt", color: 'bg-orange-500 text-white', border: 'border-orange-500' },
  SCI: { label: 'Cobalt Patrimoine', color: 'bg-emerald-600 text-white', border: 'border-emerald-600' },
  FONDATION: { label: 'Bleu de Cobalt', color: 'bg-indigo-600 text-white', border: 'border-indigo-600' },
};

// ... (Garde la constante MENU telle quelle) ...
const MENU = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: FolderKanban, label: 'Projets', href: '/projects' },
  { icon: Clock, label: 'Feuille de Temps', href: '/timesheet' },
  { icon: Users, label: 'Équipe RH', href: '/hr' }, 
  { icon: BookOpen, label: 'Savoir (Wiki)', href: '/wiki' },
  { icon: Briefcase, label: 'Clients', href: '/crm' },
  { icon: DollarSign, label: 'Finance', href: '/finance' },
  { icon: Package, label: 'Matériel', href: '/inventory' }, 
];

export default function Sidebar({ currentEntity, currentUser }: { currentEntity: string, currentUser: any }) {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // @ts-ignore
  const entityStyle = ENTITIES[currentEntity] || ENTITIES.GLOBAL;

  // --- FILTRE DE SÉCURITÉ ---
  // On récupère la liste des accès (ex: ["ARCHI", "ATELIER"])
  // Le split(',') transforme le texte "ARCHI,ATELIER" en tableau
  const allowedList = currentUser?.allowedEntities?.split(',') || [];
  
  // Est-ce un Admin Global ?
  const isSuperUser = allowedList.includes('GLOBAL');

  return (
    <div className="w-64 h-full bg-[#0A0A0C] border-r border-white/5 flex flex-col flex-shrink-0 transition-all duration-300">
      
      {/* SELECTEUR D'ENTITÉ */}
      <div className="p-4">
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all border ${entityStyle.border} bg-white/5 hover:bg-white/10 group`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-8 h-8 rounded-lg ${entityStyle.color} flex-shrink-0 flex items-center justify-center font-bold shadow-lg`}>
                {entityStyle.label[0]}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">Espace actif</p>
                <p className="text-sm font-bold text-white truncate">{entityStyle.label}</p>
              </div>
            </div>
            
            {/* On affiche la flèche SEULEMENT si l'utilisateur a plusieurs choix */}
            {(isSuperUser || allowedList.length > 1) && (
               <ChevronsUpDown size={16} className="text-gray-500 group-hover:text-white" />
            )}
          </button>

          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#141416] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
              {Object.entries(ENTITIES).map(([key, data]) => {
                
                // --- FILTRE DU MENU ---
                // Si pas SuperUser ET que l'entité n'est pas dans sa liste autorisée -> ON CACHE
                if (!isSuperUser && !allowedList.includes(key)) {
                  return null;
                }

                return (
                  <button
                    key={key}
                    onClick={async () => { 
                      await switchEntityAction(key); 
                      setIsMenuOpen(false); 
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${data.color}`} />
                    {data.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-4">Menu Principal</p>
        
        {MENU.map((item) => {
          if (item.href === '/inventory' && currentEntity !== 'GLOBAL') {
            return null;
          }
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${
                isActive 
                  ? `bg-white/10 text-white border border-white/5` 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER USER */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between px-2">
           <Link href="/profile" className="flex items-center gap-3 flex-1 overflow-hidden group hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                {currentUser ? currentUser.name.charAt(0) : '?'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">
                  {currentUser ? currentUser.name : 'Déconnecté'}
                </p>
                <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                  <Settings size={10} /> Mon Profil
                </p>
              </div>
           </Link>
           
           {/* BOUTON DÉCONNEXION */}
           <button 
             onClick={() => logoutAction()} 
             title="Se déconnecter"
             className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors"
           >
             <LogOut size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}