import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: id },
    include: { client: true }
  });

  if (!invoice) notFound();

  const tva = invoice.totalHT * 0.20;
  const ttc = invoice.totalHT + tva;

  return (
    <div className="min-h-screen bg-[#0A0A0B] p-4 md:p-12 print:p-0 print:bg-white transition-all">
      
      {/* BARRE D'OUTILS - Masquée à l'impression */}
      <div className="max-w-[21cm] mx-auto mb-10 flex justify-between items-center print:hidden">
        <Link href="/finance" className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-sm font-medium">
          <ArrowLeft size={16} /> Retour aux finances
        </Link>
        <PrintButton />
      </div>

      {/* LA FEUILLE A4 - Forçage manuel des couleurs pour contrer le mode sombre */}
      <div className="mx-auto w-full max-w-[21cm] bg-white shadow-2xl print:shadow-none overflow-hidden border border-white/5">
        
        <div className="p-12 md:p-20 flex flex-col min-h-[29.7cm] bg-white" style={{ color: '#1a1a1a' }}>
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-24">
            <div className="space-y-6">
              <div className="bg-indigo-600 text-white w-14 h-14 flex items-center justify-center rounded-2xl font-black text-3xl shadow-xl shadow-indigo-500/20">C</div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black uppercase tracking-tighter" style={{ color: '#1a1a1a' }}>Collectif Cobalt</h1>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em]">Studio de Création & Architecture</p>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-6xl font-black uppercase tracking-tighter mb-4" style={{ color: '#f1f5f9' }}>Facture</h2>
              <div className="space-y-1">
                <p className="font-mono font-bold text-indigo-600">REF_{invoice.number}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Le {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* ADRESSES */}
          <div className="grid grid-cols-2 gap-20 mb-24 py-12 border-y border-slate-100">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#4f46e5' }}>Émetteur</h3>
              <div className="space-y-2">
                <p className="font-bold text-lg" style={{ color: '#1a1a1a' }}>Collectif Cobalt</p>
                <div className="text-xs space-y-1" style={{ color: '#64748b' }}>
                   <p>5 Rue du Puis-le-Vlier</p>
                   <p>86000 Poitiers, France</p>
                   <p className="pt-2 italic text-[10px]">SIRET: 123 456 789 00012</p>
                </div>
              </div>
            </div>

            <div className="text-right space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Destinataire</h3>
              <div className="space-y-2">
                <p className="font-bold text-lg" style={{ color: '#1a1a1a' }}>{invoice.client.name}</p>
                <div className="text-xs space-y-1" style={{ color: '#64748b' }}>
                   <p>{invoice.client.address || "Adresse de facturation"}</p>
                   <p className="text-indigo-600 font-medium">{invoice.client.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABLEAU */}
          <div className="flex-grow">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="pb-6 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Description</th>
                  <th className="pb-6 text-right text-[10px] font-black uppercase tracking-[0.2em] w-32" style={{ color: '#94a3b8' }}>Total HT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-12 border-b border-slate-100">
                    <p className="font-bold text-xl mb-2" style={{ color: '#1a1a1a' }}>Prestation Créative Globale</p>
                    <p className="text-sm leading-relaxed max-w-lg italic" style={{ color: '#64748b' }}>
                      Conception et réalisation sur-mesure selon les termes du cahier des charges.
                    </p>
                  </td>
                  <td className="py-12 border-b border-slate-100 text-right align-top">
                    <span className="font-black text-2xl" style={{ color: '#1a1a1a' }}>{invoice.totalHT.toLocaleString('fr-FR')} €</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="mt-16 flex justify-end">
            <div className="w-80 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-2" style={{ color: '#94a3b8' }}>
                <span>Base Hors Taxes</span>
                <span style={{ color: '#1a1a1a' }}>{invoice.totalHT.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-2" style={{ color: '#94a3b8' }}>
                <span>TVA (20%)</span>
                <span style={{ color: '#1a1a1a' }}>{tva.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="bg-indigo-600 p-8 rounded-3xl flex justify-between items-center text-white shadow-2xl shadow-indigo-600/30">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Total TTC</span>
                <span className="text-4xl font-black">{ttc.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-24 pt-10 border-t border-slate-50 text-center">
            <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: '#cbd5e1' }}>
              Paiement sous 30 jours — Collectif Cobalt Biarritz — www.cobalt-collectif.fr
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}