import { prisma } from "@/app/lib/prisma";
import { updateInvoiceAction } from "@/app/actions";
import { ArrowLeft, Save, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from "next/navigation";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true } // On inclut le client plutôt que le projet pour voir à qui appartient la facture
  });

  if (!invoice) notFound();

  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh', padding: '40px', color: 'white' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <Link href="/finance" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '30px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Retour à la finance
        </Link>

        <form action={updateInvoiceAction}>
          <input type="hidden" name="invoiceId" value={invoice.id} />

          {/* HEADER FACTURE */}
          <div style={{ backgroundColor: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#6366f1', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>FACTURE {invoice.number}</span>
                <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '5px 0' }}>Détails du Paiement</h1>
                <p style={{ color: '#64748b' }}>Client : {invoice.client?.name || "Inconnu"}</p>
              </div>
              <button type="submit" style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Save size={18} /> Enregistrer
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* CONFIGURATION FINANCIÈRE */}
            <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={18} color="#6366f1" /> Montant & Statut
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>MONTANT TOTAL HT (€)</label>
                {/* On utilise totalHT ici */}
                <input name="amount" type="number" step="0.01" defaultValue={invoice.totalHT} style={{ width: '100%', backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px', color: 'white', fontSize: '18px', fontWeight: 'bold' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>STATUT DE PAIEMENT</label>
                <select name="status" defaultValue={invoice.status} style={{ width: '100%', backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px', color: 'white', cursor: 'pointer' }}>
                  <option value="DRAFT">Brouillon</option>
                  <option value="SENT">Envoyée</option>
                  <option value="PAID">Payée ✅</option>
                </select>
              </div>
            </div>

            {/* DATES & INFOS */}
            <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="#6366f1" /> Échéance
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>DATE DE FACTURATION</label>
                {/* On utilise date ici */}
                <input type="date" name="issuedAt" defaultValue={invoice.date?.toISOString().split('T')[0]} style={{ width: '100%', backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px', color: 'white' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>DATE LIMITE DE PAIEMENT</label>
                <input type="date" name="dueDate" defaultValue={invoice.dueDate?.toISOString().split('T')[0]} style={{ width: '100%', backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px', color: 'white' }} />
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}