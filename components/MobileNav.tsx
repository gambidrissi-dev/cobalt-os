"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Briefcase, DollarSign, Menu } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: LayoutDashboard, label: 'Accueil' },
    { href: '/projects', icon: FolderKanban, label: 'Projets' },
    { href: '/crm', icon: Briefcase, label: 'CRM' },
    { href: '/finance', icon: DollarSign, label: 'Finance' },
    { href: '/settings', icon: Menu, label: 'Menu' },
  ];

  return (
    // ZERO POSITIONNEMENT ICI. Juste du design (couleur, bordure, padding).
    <div className="w-full bg-[#0A0A0C] border-t border-white/10 px-6 py-4">
      <div className="flex justify-between items-center">
        {links.map((link) => {
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
  );
}