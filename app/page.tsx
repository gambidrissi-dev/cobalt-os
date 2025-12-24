import { prisma } from "./lib/prisma";
import { TrendingUp, Users, Briefcase, Clock, AlertTriangle, Flame, Target, Star } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const now = new Date();
  const ANNUAL_GOAL = 50000;

  const [totalInvoices, projectCount, clientCount, recentProjects, lateInvoices, archiProjects, mediaProjects, topClients] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { totalHT: true } }),
    prisma.project.count(),
    prisma.client.count(),
    prisma.project.findMany({
      take: 5,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: { client: true }
    }),
    prisma.invoice.findMany({
      where: { status: { not: "PAID" }, dueDate: { lt: now } },
      include: { client: true }
    }),
    prisma.project.count({ where: { type: "archi" } }),
    prisma.project.count({ where: { type: "media" } }),
    prisma.client.findMany({
      take: 3,
      include: { _count: { select: { invoices: true } } },
      orderBy: { invoices: { _count: 'desc' } }
    })
  ]);

  const currentCA = totalInvoices._sum.totalHT || 0;
  const progressPercent = Math.min(Math.round((currentCA / ANNUAL_GOAL) * 100), 100);

  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh', padding: '40px', color: 'white' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <header style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Command Center</h1>
             <span style={{ backgroundColor: '#4f46e5', padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '900' }}>V2.1</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '18px', marginTop: '10px' }}>Intelligence business et croissance du collectif</p>
        </header>

        {/* ALERTES & OBJECTIFS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '40px' }}>
           <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '32px', border: '1px solid #1f2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}><Target size={16}/> Objectif Annuel</span>
                <span style={{ fontWeight: '900', color: '#4f46e5' }}>{progressPercent}%</span>
              </div>
              <div style={{ height: '12px', backgroundColor: '#1f2937', borderRadius: '10px', overflow: 'hidden' }}>
                {/* FIX LIGNE 58 : Utilisation des backticks correcte */}
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#4f46e5' }}></div>
              </div>
              <p style={{ marginTop: '15px', fontSize: '12px', color: '#64748b' }}>{currentCA.toLocaleString()}€ sur {ANNUAL_GOAL.toLocaleString()}€</p>
           </div>

           {lateInvoices.length > 0 && (
             <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '25px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <AlertTriangle size={24} color="#ef4444" />
                <p style={{ margin: 0, fontWeight: 'bold', color: '#fca5a5' }}>{lateInvoices.length} factures en retard</p>
                <Link href="/finance" style={{ marginLeft: 'auto', color: '#ef4444', fontSize: '12px', fontWeight: '900', textDecoration: 'none' }}>AGIR →</Link>
             </div>
           )}
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '50px' }}>
          <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
            <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Chiffre d'Affaires</p>
            <h3 style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px' }}>{currentCA.toLocaleString()} €</h3>
          </div>
          <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
            <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Architecture</p>
            <h3 style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px', color: '#3b82f6' }}>{archiProjects} Projets</h3>
          </div>
          <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
            <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Média</p>
            <h3 style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px', color: '#a855f7' }}>{mediaProjects} Projets</h3>
          </div>
          <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
            <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Conversion</p>
            <h3 style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px', color: '#10b981' }}>{clientCount > 0 ? (projectCount / clientCount).toFixed(1) : 0} p/c</h3>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
          <div style={{ backgroundColor: '#141416', padding: '40px', borderRadius: '32px', border: '1px solid #1f2937' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={18} color="#4f46e5" /> Pipeline Production</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentProjects.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '18px', backgroundColor: '#1c1c1f', borderRadius: '18px', borderLeft: p.priority === 'URGENT' ? '4px solid #ef4444' : 'none' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {p.priority === 'URGENT' && <Flame size={14} color="#ef4444" />}
                    <div>
                      <p style={{ fontWeight: 'bold', margin: 0, fontSize: '14px' }}>{p.title}</p>
                      <p style={{ color: '#64748b', fontSize: '11px', margin: '4px 0 0 0' }}>{p.client?.name || "Direct"}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '9px', backgroundColor: '#1e1b4b', color: '#a5b4fc', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', alignSelf: 'center' }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '32px', border: '1px solid #1f2937' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Star size={16} color="#f59e0b"/> Partenaires Tops</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topClients.map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '13px', color: '#94a3b8' }}>{i+1}. {c.name}</span>
                       <span style={{ fontSize: '11px', color: '#64748b' }}>{c._count.invoices} fac.</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#4f46e5', padding: '30px', borderRadius: '32px', flexGrow: 1 }}>
                <h3 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 10px 0' }}>Actions</h3>
                <p style={{ fontSize: '12px', opacity: '0.8', margin: '0 0 20px 0' }}>Faites croître Cobalt OS.</p>
                <Link href="/crm" style={{ display: 'block', backgroundColor: 'white', color: '#4f46e5', textAlign: 'center', padding: '12px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', marginBottom: '10px' }}>+ Client</Link>
                <Link href="/finance" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', textAlign: 'center', padding: '12px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' }}>+ Facture</Link>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}