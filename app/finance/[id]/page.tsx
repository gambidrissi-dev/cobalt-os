import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-[#0A0A0B] p-4 md:p-8 print:p-0 print:bg-white">
      
      <div className="max-w-[21cm] mx-auto mb-8 flex justify-between items-center print:hidden">
        <Link href="/finance" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Retour aux finances
        </Link>
        <PrintButton />
      </div>

      {/* LA FEUILLE A4 - Forçage manuel des couleurs */}
      <div 
        className="mx-auto w-full max-w-[21cm] bg-white shadow-2xl print:shadow-none"
        style={{ color: '#0f172a', backgroundColor: 'white' }} 
      >
        <div className="p-12 md:p-20 flex flex-col min-h-[29.7cm]">
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-20">
            <div>
              <div className="bg-indigo-600 text-white w-12 h-12 flex items-center justify-center rounded-xl mb-4 font-black text-2xl">C</div>
              <h1 className="text-2xl font-black uppercase tracking-tighter" style={{ color: '#0f172a' }}>Collectif Cobalt</h1>
              <p style={{ color: '#64748b' }} className="text-xs font-bold uppercase tracking-widest">Architecture & Design</p>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-black uppercase tracking-tighter" style={{ color: '#f1f5f9' }}>Facture</h2>
              <p className="font-mono font-bold text-lg" style={{ color: '#4f46e5' }}>N° {invoice.number}</p>
              <p style={{ color: '#94a3b8' }} className="text-sm">Le {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* ADRESSES */}
          <div className="grid grid-cols-2 gap-20 mb-24">
            <div style={{ borderLeft: '4px solid #4f46e5' }} className="pl-6">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#4f46e5' }}>Émetteur</p>
              <p className="font-extrabold text-lg" style={{ color: '#0f172a' }}>Collectif Cobalt</p>
              <p style={{ color: '#475569' }} className="text-sm leading-relaxed">
                5 Rue du Puis-le-Vlier<br />
                86000 Poitiers, France
              </p>
            </div>
            <div className="text-right pr-6" style={{ borderRight: '4px solid #f1f5f9' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>Client</p>
              <p className="font-extrabold text-lg" style={{ color: '#0f172a' }}>{invoice.client.name}</p>
              <p style={{ color: '#475569' }} className="text-sm leading-relaxed">
                {invoice.client.email}<br />
                {invoice.client.address || "Adresse de facturation"}
              </p>
            </div>
          </div>

          {/* TABLEAU */}
          <div className="flex-grow">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid #0f172a' }}>
                  <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Description</th>
                  <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Total HT</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td className="py-12">
                    <p className="font-bold text-xl mb-2" style={{ color: '#0f172a' }}>Prestation créative sur-mesure</p>
                    <p style={{ color: '#64748b' }} className="text-sm max-w-md italic leading-relaxed">Réalisation selon les termes définis dans le devis. Inclut conception et livraison.</p>
                  </td>
                  <td className="py-12 text-right font-black text-2xl" style={{ color: '#0f172a' }}>
                    {invoice.totalHT.toLocaleString('fr-FR')} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="flex justify-end mt-16 pt-10" style={{ borderTop: '4px solid #f8fafc' }}>
            <div className="w-72 space-y-4">
              <div className="flex justify-between font-bold" style={{ color: '#64748b' }}>
                <span>Total HT</span>
                <span>{invoice.totalHT.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#94a3b8' }}>
                <span>TVA (20%)</span>
                <span>{tva.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-3xl font-black pt-4" style={{ color: '#4f46e5', borderTop: '2px solid #0f172a' }}>
                <span>TOTAL TTC</span>
                <span>{ttc.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-8 text-[10px] text-center uppercase font-bold tracking-tighter" style={{ color: '#94a3b8', borderTop: '1px solid #f1f5f9' }}>
            Collectif Cobalt — SIRET 123 456 789 00012 — FR98123456789
          </div>
        </div>
      </div>
    </div>
  );
}