"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, DollarSign, Settings, FolderKanban } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/' },
  { icon: FolderKanban, label: 'Projets', href: '/projects' },
  { icon: Users, label: 'Ressources Humaines', href: '/hr' },
  { icon: Briefcase, label: 'CRM & Ventes', href: '/crm' },
  { icon: DollarSign, label: 'Finance', href: '/finance' },
  { icon: Settings, label: 'Paramètres', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    // ZERO positionnement ici ("fixed" ou "h-screen" interdits ici)
    <div className="w-64 h-full bg-[#0A0A0C] border-r border-white/5 flex flex-col">
      <div className="p-6">
         <div className="font-bold text-xl text-white tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">C</div>
            Cobalt OS
         </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/5">
         <div className="bg-[#141416] p-4 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
            <div>
               <p className="text-white text-sm font-bold">Admin</p>
               <p className="text-xs text-gray-500">Connecté</p>
            </div>
         </div>
      </div>
    </div>
  );
}