import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutShell from '../components/LayoutShell';
import { CommandMenu } from '../components/CommandMenu'; // <--- 1. On importe le menu

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cobalt OS',
  description: 'Système de gestion interne',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-black text-white`}>
        
        {/* 2. On place le menu ICI pour qu'il soit disponible partout (invisible tant qu'on ne fait pas CMD+K) */}
        <CommandMenu />

        {/* Le reste de l'interface */}
        <LayoutShell>
           {children}
        </LayoutShell>
      </body>
    </html>
  );
}