import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
// 1. On importe getCurrentUser ici
import { getActiveEntity, getCurrentUser } from '@/app/actions/auth';
import { CommandMenu } from '@/components/CommandMenu';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Cobalt OS V2',
  description: 'Operating System for Architects & Makers',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // On récupère l'entité active via le cookie
  const currentEntity = await getActiveEntity();
  
  // 2. On récupère l'utilisateur connecté (Server Side)
  const currentUser = await getCurrentUser();

  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-black text-white flex h-screen overflow-hidden`}>
        
        {/* On garde le menu CMD+K car il est top */}
        <CommandMenu />
        
        {/* Sidebar avec Entité ET Utilisateur */}
        {/* 3. On passe currentUser à la Sidebar */}
        <Sidebar currentEntity={currentEntity} currentUser={currentUser} />

        {/* Contenu Principal */}
        <main className="flex-1 overflow-y-auto relative bg-[#050505]">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="p-8 max-w-[1600px] mx-auto relative z-10">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}