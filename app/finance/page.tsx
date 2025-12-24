import { prisma } from "../lib/prisma";
import { createQuickInvoice } from "@/app/actions";
import { Plus, FileText, CheckCircle, Clock, AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function FinancePage() {
  // On récupère toutes les factures avec les infos du client associé
  const invoices = await prisma.invoice.findMany({
    orderBy: { date: 'desc' },
    include: { client: true }
  });

  return (
    <div className="space-y-8 fade-in">
      {/* EN-TÊTE DE LA PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Finance</h1>
          <p className="text-gray-400">Suivi de la facturation et des revenus</p>
        </div>
        
        {/* BOUTON DE CRÉATION RAPIDE */}
        <form action={createQuickInvoice}>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Créer un brouillon
          </button>
        </form>
      </div>

      {/* TABLEAU DES FACTURES */}
      <div className="bg-[#141416] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
              <th className="p-6">Référence</th>
              <th className="p-6">Client</th>
              <th className="p-6 text-right">Montant HT</th>
              <th className="p-6 text-center">Statut</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                {/* LIEN VERS LE PDF */}
                <td className="p-6">
                  <Link 
                    href={`/finance/${inv.id}`} 
                    className="flex items-center gap-3 text-white font-mono text-sm hover:text-emerald-400 transition-colors"
                  >
                    <FileText size={16} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                    {inv.number}
                  </Link>
                </td>

                <td className="p-6">
                  <span className="text-gray-300 font-medium">
                    {inv.client?.name || "Client non assigné"}
                  </span>
                </td>

                <td className="p-6 text-right">
                  <span className="text-white font-bold tracking-tight">
                    {inv.totalHT.toLocaleString('fr-FR')} €
                  </span>
                </td>

                <td className="p-6 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    inv.status === 'SENT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-white/5 text-gray-400 border-white/10'
                  }`}>
                    {inv.status === 'PAID' ? 'Payée' : inv.status === 'SENT' ? 'Envoyée' : 'Brouillon'}
                  </span>
                </td>

                <td className="p-6 text-right">
                  <Link 
                    href={`/finance/${inv.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-colors"
                  >
                    Voir PDF <ArrowUpRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
            
            {/* ÉTAT VIDE */}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle size={40} className="text-gray-800" />
                    <p className="text-gray-500 text-sm">
                      Aucune facture trouvée. <br />
                      Créez d'abord un client pour générer votre première facture.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}