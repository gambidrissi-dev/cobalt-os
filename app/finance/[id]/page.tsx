"use client"; // CRUCIAL pour corriger l'erreur de build

import { useEffect, useState, use } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

// On utilise "use" pour déballer les params de manière asynchrone
export default function InvoicePDFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<any>(null);

  // Comme c'est un client component, on récupère les données via une petite API interne ou un fetch rapide
  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then(res => res.json())
      .then(data => setInvoice(data));
  }, [id]);

  if (!invoice) return <div className="p-20 text-white">Chargement du document...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-10 font-sans">
      {/* BARRE D'OUTILS - CACHÉE À L'IMPRESSION */}
      <div className="mb-10 flex justify-between items-center print:hidden bg-gray-100 p-4 rounded-xl">
        <Link href="/finance" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors no-underline">
          <ArrowLeft size={18} /> Retour Finance
        </Link>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all border-none cursor-pointer"
        >
          <Printer size={18} /> Imprimer / Sauver en PDF
        </button>
      </div>

      {/* DESIGN DE LA FACTURE */}
      <div className="max-w-[800px] mx-auto border border-gray-200 p-12 bg-white shadow-lg">
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 italic">COBALT</h1>
            <p className="text-gray-500 text-sm uppercase tracking-widest">Studio de création</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase text-blue-600 mb-1">Facture</h2>
            <p className="font-mono font-bold text-lg m-0">{invoice.number}</p>
            <p className="text-gray-500 text-sm">{new Date(invoice.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-20 mb-16">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Émetteur</p>
            <p className="font-bold m-0 text-lg">Collectif Cobalt</p>
            <p className="text-sm text-gray-600">contact@cobalt-collectif.fr</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Destinaire</p>
            <p className="font-bold m-0 text-lg">{invoice.client?.name || "Client"}</p>
            <p className="text-sm text-gray-600 italic">Prestation Média / Archi</p>
          </div>
        </div>

        <table className="w-full mb-16 border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-4 text-xs uppercase font-black">Désignation</th>
              <th className="text-right py-4 text-xs uppercase font-black">Total HT</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-8 font-medium">Forfait création et production de contenus</td>
              <td className="py-8 text-right font-bold text-2xl">{invoice.totalHT.toLocaleString()} €</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-20">
          <div className="bg-gray-50 p-8 rounded-2xl w-72 text-right">
            <span className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Total Net à payer</span>
            <span className="text-3xl font-black text-blue-600">{invoice.totalHT.toLocaleString()} €</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 text-[10px] text-gray-400 text-center uppercase tracking-[0.3em]">
          Document généré par Cobalt OS — 2025
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print\:hidden { display: none !important; }
          body { background: white !important; margin: 0; }
          .min-h-screen { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}