import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react"; 
import Link from "next/link";
import { updateInvoice } from "@/app/actions/invoice";
import PrintButton from "@/components/PrintButton"; 

// Infos légales statiques par entité
const LEGAL_INFOS = {
  ARCHI: {
    name: "COBALT ARCHITECTURE",
    address: "12 Rue de la Paix, 75000 Paris",
    siret: "SIRET 123 456 789 00012",
    tva: "FR 12 123456789",
    color: "text-blue-600",
    bg: "bg-blue-600",
    footer: "Membre de l'ordre des architectes - Assurance MAF n°123456"
  },
  ATELIER: {
    name: "L'ATELIER COBALT",
    address: "Zone Artisanale Sud, 33000 Bordeaux",
    siret: "SIRET 987 654 321 00056",
    tva: "FR 99 987654321",
    color: "text-orange-500",
    bg: "bg-orange-500",
    footer: "Artisan d'Art - Assurance Décennale n°987654"
  },
  // Fallback
  SCI: { name: "COBALT PATRIMOINE", address: "Paris", siret: "", tva: "", color: "text-emerald-600", bg: "bg-emerald-600", footer: "" },
  FONDATION: { name: "FONDATION COBALT", address: "Paris", siret: "", tva: "", color: "text-purple-600", bg: "bg-purple-600", footer: "" },
  GLOBAL: { name: "GROUPE COBALT", address: "", siret: "", tva: "", color: "text-gray-600", bg: "bg-gray-600", footer: "" },
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true }
  });

  if (!invoice) notFound();

  // @ts-ignore
  const branding = LEGAL_INFOS[invoice.entity] || LEGAL_INFOS.ARCHI;
  const tvaAmount = invoice.totalHT * 0.20;
  const totalTTC = invoice.totalHT + tvaAmount;

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans p-8 print:p-0 print:bg-white">
      
      {/* BARRE D'OUTILS (Cachée à l'impression) */}
      <div className="max-w-[210mm] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <Link href="/finance" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Retour Finance
        </Link>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          {/* Formulaire Montant */}
          <form action={async (formData) => {
            "use server";
            const amount = parseFloat(formData.get("amount") as string);
            await updateInvoice(invoice.id, { totalHT: amount });
          }} className="flex items-center gap-2 pr-4 border-r border-gray-200">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-2">Montant HT</label>
             <input 
               name="amount" 
               type="number" 
               step="0.01" 
               defaultValue={invoice.totalHT} 
               className="w-24 text-right font-mono font-bold text-lg outline-none bg-transparent hover:bg-gray-50 focus:bg-blue-50 rounded px-1 transition-colors" 
             />
             <button title="Sauvegarder" className="p-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors shadow-lg">
                <Save size={14}/>
             </button>
          </form>

          {/* Bouton Impression */}
          <PrintButton />
        </div>
      </div>

      {/* FEUILLE A4 (Format Facture) */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none p-[15mm] flex flex-col justify-between relative overflow-hidden">
        
        {/* Bandeau latéral décoratif */}
        <div className={`absolute top-0 left-0 w-3 h-full ${branding.bg} print:w-2`}></div>

        {/* --- HEADER --- */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-16 pl-8">
            <div className="max-w-[50%]">
              <h1 className={`text-4xl font-black tracking-tighter italic mb-4 ${branding.color} leading-none`}>{branding.name}</h1>
              <div className="text-gray-500 text-xs uppercase tracking-widest space-y-1.5 font-medium">
                <p>{branding.address}</p>
                <p>{branding.siret}</p>
                <p>{branding.tva}</p>
              </div>
            </div>
            
            <div className="text-right relative">
              {/* Le Watermark */}
              <h2 className="text-8xl font-black text-slate-100 tracking-tighter absolute -top-6 -right-6 -z-10 select-none pointer-events-none">
                FACTURE
              </h2>
              
              <div className="relative z-10 pt-4">
                <p className="font-mono text-xl font-bold tracking-tight">{invoice.number}</p>
                <div className="mt-2 space-y-1">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Date : <span className="text-black">{new Date(invoice.createdAt).toLocaleDateString()}</span></p>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Échéance : <span className="text-black">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* CLIENT */}
          <div className="flex justify-end mb-20">
            <div className="w-1/2 bg-slate-50 p-8 rounded-l-2xl border-l-4 border-slate-200">
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-widest">Facturé à</p>
              <p className="font-bold text-xl text-black mb-1">{invoice.client.name}</p>
              <p className="text-gray-600 text-sm">{invoice.client.email}</p>
              <p className="text-gray-400 text-xs uppercase mt-2 tracking-wider">{invoice.client.type}</p>
            </div>
          </div>

          {/* LIGNES DE FACTURE */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-4 text-xs uppercase font-black tracking-widest pl-4">Description</th>
                <th className="text-right py-4 text-xs uppercase font-black tracking-widest pr-4">Total HT</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-8 pl-4">
                  <p className="font-bold text-lg mb-2">Prestation de services - {invoice.entity}</p>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                    Honoraires selon avancement ou devis signé.<br/>
                    Référence dossier : {invoice.projectId ? `Projet #${invoice.projectId.slice(-4)}` : 'Mission ponctuelle'}
                  </p>
                </td>
                <td className="py-8 pr-4 text-right font-mono text-xl font-bold align-top">
                  {invoice.totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* --- TOTAUX --- */}
        <div className="flex justify-end mb-16 relative z-10">
          <div className="w-72 space-y-4">
            <div className="flex justify-between text-gray-500 text-sm font-medium">
              <span>Total HT</span>
              <span>{invoice.totalHT.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm font-medium">
              <span>TVA (20%)</span>
              <span>{tvaAmount.toLocaleString('fr-FR')} €</span>
            </div>
            <div className={`flex justify-between items-center pt-6 border-t-2 ${branding.color.replace('text', 'border')} font-black text-2xl`}>
              <span>NET À PAYER</span>
              <span>{totalTTC.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </div>

        {/* --- FOOTER LÉGAL --- */}
        <div className="text-center text-[10px] text-gray-400 border-t border-gray-100 pt-8 pb-4 relative z-10">
          <p className="uppercase tracking-widest mb-2 font-bold text-gray-300">{branding.footer}</p>
          <p className="max-w-2xl mx-auto leading-relaxed">
            En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée. 
            Indemnité forfaitaire pour frais de recouvrement : 40€. Pas d'escompte pour paiement anticipé.
          </p>
          <p className="mt-4 font-mono text-gray-300">Généré par Cobalt OS</p>
        </div>

      </div>
    </div>
  );
}