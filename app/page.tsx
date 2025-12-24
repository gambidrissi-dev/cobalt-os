import { prisma } from "./lib/prisma";
import { TrendingUp, Users, Briefcase, ArrowUpRight, Clock, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const [totalInvoices, projectCount, clientCount, recentProjects] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { totalHT: true } }),
    prisma.project.count(),
    prisma.client.count(),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true }
    })
  ]);

  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh', padding: '40px', color: 'white' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <header style={{ marginBottom: '50px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Tableau de bord</h1>
          <p style={{ color: '#64748b', fontSize: '18px', marginTop: '10px' }}>Collectif Cobalt — Gestion en temps réel</p>
        </header>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
          
          <div style={{ backgroundColor: '#141416', padding: '40px', borderRadius: '32px', border: '1px solid #1f2937' }}>
            <div style={{ color: '#10b981', marginBottom: '20px' }}><TrendingUp size={32} /></div>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Chiffre d'Affaires</p>
            <h3 style={{ fontSize: '36px', fontWeight: '900', marginTop: '10px' }}>{(totalInvoices._sum.totalHT || 0).toLocaleString()} €</h3>
          </div>

          <div style={{ backgroundColor: '#141416', padding: '40px', borderRadius: '32px', border: '1px solid #1f2937' }}>
            <div style={{ color: '#3b82f6', marginBottom: '20px' }}><Briefcase size={32} /></div>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Projets Actifs</p>
            <h3 style={{ fontSize: '36px', fontWeight: '900', marginTop: '10px' }}>{projectCount}</h3>
          </div>

          <div style={{ backgroundColor: '#141416', padding: '40px', borderRadius: '32px', border: '1px solid #1f2937' }}>
            <div style={{ color: '#a855f7', marginBottom: '20px' }}><Users size={32} /></div>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Clients Totaux</p>
            <h3 style={{ fontSize: '36px', fontWeight: '900', marginTop: '10px' }}>{clientCount}</h3>
          </div>

        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* RECENT ACTIVITY */}
          <div style={{ backgroundColor: '#141416', padding: '40px', borderRadius: '32px', border: '1px solid #1f2937' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} /> Activité récente</h3>
              <Link href="/projects" style={{ color: '#6366f1', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>VOIR TOUT →</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentProjects.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: '#1c1c1f', borderRadius: '20px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{p.title}</p>
                    <p style={{ color: '#64748b', fontSize: '12px', margin: '5px 0 0 0' }}>{p.client?.name || "Projet interne"}</p>
                  </div>
                  <span style={{ fontSize: '10px', backgroundColor: '#312e81', color: '#a5b4fc', padding: '5px 10px', borderRadius: '8px', fontWeight: 'bold' }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ backgroundColor: '#4f46e5', padding: '40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: '900', lineHeight: '1' }}>Nouvelle mission ?</h3>
              <p style={{ marginTop: '15px', opacity: '0.8', fontSize: '14px' }}>Gérez vos clients et vos factures en un clic.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
              <Link href="/crm" style={{ backgroundColor: 'white', color: '#4f46e5', textAlign: 'center', padding: '15px', borderRadius: '15px', fontWeight: 'bold', textDecoration: 'none' }}>Nouveau Client</Link>
              <Link href="/finance" style={{ backgroundColor: '#4338ca', color: 'white', textAlign: 'center', padding: '15px', borderRadius: '15px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid #6366f1' }}>Générer Facture</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}