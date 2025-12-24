"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PanelLeftClose, PanelLeftOpen, 
  LayoutDashboard, FolderKanban, Briefcase, DollarSign, Menu 
} from 'lucide-react';
import Sidebar from './Sidebar';

// On définit les liens directement ici
const MOBILE_LINKS = [
  { href: '/', icon: LayoutDashboard },
  { href: '/projects', icon: FolderKanban },
  { href: '/crm', icon: Briefcase },
  { href: '/finance', icon: DollarSign },
  { href: '/settings', icon: Menu },
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-black relative overflow-x-hidden">
      
      {/* 1. BOUTON FLOTTANT (Rond Bleu) */}
      <button 
        onClick={() => setIsNavVisible(!isNavVisible)}
        className="fixed bottom-6 right-6 z-[100] p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 transition-all active:scale-95"
      >
        {isNavVisible ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
      </button>

      {/* 2. SIDEBAR (Pour PC) */}
      {/* hidden = caché tout le temps */}
      {/* md:block = visible seulement à partir de la taille tablette/PC */}
      <div 
        className={`
            hidden md:block fixed top-0 left-0 h-screen z-50
            transition-transform duration-300 ease-in-out bg-[#0A0A0C] border-r border-white/5
            ${isNavVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </div>

      {/* 3. MENU MOBILE (Intégré ici directement) */}
      {/* md:hidden = CACHÉ DÈS QU'ON EST SUR PC. C'est la règle d'or. */}
      <div 
        className={`
            md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0A0A0C] border-t border-white/10 px-6 py-4
            transition-transform duration-300 ease-in-out
            ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
         <div className="flex justify-between items-center">
            {MOBILE_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className="flex flex-col items-center gap-1">
                  <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                    <link.icon size={20} />
                  </div>
                </Link>
              );
            })}
         </div>
      </div>

      {/* 4. CONTENU PRINCIPAL */}
      <main 
        className={`
            flex-1 p-4 md:p-8 min-h-screen w-full
            transition-all duration-300 ease-in-out
            ${isNavVisible ? 'md:ml-64 pb-28 md:pb-8' : 'md:ml-0 pb-4'}
        `}
      >
         {/* En-tête mobile (Logo) - Caché sur PC */}
         <div className={`md:hidden flex items-center gap-2 mb-6 pt-2 transition-opacity duration-300 ${isNavVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">C</div>
            <span className="font-bold text-xl tracking-tighter text-white">Cobalt OS</span>
         </div>

         {children}
      </main>

    </div>
  );
}