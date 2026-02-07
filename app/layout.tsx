import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, getActiveEntity } from "@/app/actions/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cobalt OS",
  description: "ERP for Collectif Cobalt",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const user = await getCurrentUser();
  const entity = await getActiveEntity();

  return (
    <html lang="fr">
      <body className={`${inter.className} bg-black text-white flex h-screen overflow-hidden`}>
        {user && <Sidebar currentEntity={entity} currentUser={user} />}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
