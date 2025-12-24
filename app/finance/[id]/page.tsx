import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton"; // On importe notre nouveau bouton

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params; // On attend les params comme vu précédemment

  const invoice = await prisma.invoice.findUnique({
    where: { id: id },
    include: { client: true }
  });

  if (!invoice) notFound();

  const tva = invoice.totalHT * 0.20;
  const ttc = invoice.totalHT + tva;

  return (
    <div className="space-y-6">
      {/* BARRE D'OUTILS (Invisible à l'impression) */}
      <div className="flex justify-between items-center print:hidden">
        <Link href="/finance" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Retour
        </Link>
        
        {/* On utilise notre nouveau composant client ici */}
        <PrintButton />
      </div>

      {/* LA FACTURE (Format A4) */}
      <div className="bg-white text-slate-900 p-12 shadow-2xl mx-auto w-full max-w-[21cm] min-h-[29.7cm] print:shadow-none print:m-0 print:w-full">
        
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-indigo-600 mb-1">COBALT</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Collectif Créatif</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Facture</h2>
            <p className="text-slate-500 font-mono">#{invoice.number}</p>
            <p className="text-sm text-slate-400 mt-2">Émise le {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 border-b pb-1">De</p>
            <p className="font-bold">Collectif Cobalt</p>
            <p className="text-slate-600 text-sm">5 Rue du Puis-le-Vlier</p>
            <p className="text-slate-600 text-sm">86000 Poitiers</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 border-b pb-1">À l'attention de</p>
            <p className="font-bold">{invoice.client.name}</p>
            <p className="text-slate-600 text-sm">{invoice.client.address || "Adresse non renseignée"}</p>
            <p className="text-slate-600 text-sm">{invoice.client.email}</p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-slate-900 text-sm uppercase">
              <th className="py-4 text-left">Description</th>
              <th className="py-4 text-right">Montant HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-6">
                <p className="font-bold text-slate-800 text-lg">Prestation Créative Globale</p>
                <p className="text-slate-500 text-sm italic">Détails de la mission selon devis accepté.</p>
              </td>
              <td className="py-6 text-right font-bold text-lg">{invoice.totalHT.toLocaleString('fr-FR')} €</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end pt-8 border-t-2 border-slate-900">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-slate-500">
              <span>Total HT</span>
              <span>{invoice.totalHT.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between text-slate-500 pb-3 border-b">
              <span>TVA (20%)</span>
              <span>{tva.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-900 pt-1">
              <span>TOTAL TTC</span>
              <span>{ttc.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-20 text-[10px] text-slate-400 text-center leading-relaxed">
          <p>Collectif Cobalt — SIRET 123 456 789 00012 — TVA Intracommunautaire FR98123456789</p>
          <p className="mt-2 text-[8px]">Paiement par virement bancaire sous 30 jours.</p>
        </div>
      </div>
    </div>
  );
}