import { prisma } from "../lib/prisma";
import { createQuickInvoice } from "@/app/actions"; // Import de l'action
import { Plus, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default async function FinancePage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { date: 'desc' },
    include: { client: true }
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Finance</h1>
          <p className="text-gray-400">Facturation et trésorerie</p>
        </div>
        
        {/* --- BOUTON D'ACTION RÉEL --- */}
        {/* Note: Il faut avoir au moins un client dans le CRM pour que ça marche ! */}
        <form action={createQuickInvoice}>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all flex items-center gap-2">
            <Plus size={18} />
            Créer Brouillon
            </button>
        </form>
        {/* ---------------------------- */}
      </div>

      <div className="bg-[#141416] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-6 font-medium">Référence</th>
              <th className="p-6 font-medium">Client</th>
              <th className="p-6 font-medium text-right">Montant HT</th>
              <th className="p-6 font-medium text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="p-6 text-white font-mono text-sm">{inv.number}</td>
                <td className="p-6 text-gray-300 font-medium">{inv.client?.name || "Client inconnu"}</td>
                <td className="p-6 text-white font-bold text-right">{inv.totalHT.toLocaleString()} €</td>
                <td className="p-6 text-center">
                    <span className="text-xs bg-white/10 text-white px-2 py-1 rounded">{inv.status}</span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-gray-500">Aucune facture. Créez des clients d'abord !</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}