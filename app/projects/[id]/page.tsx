import { prisma } from "@/app/lib/prisma";
import { updateProjectAction } from "@/app/actions";
import { 
  ArrowLeft, Calendar, Clock, Euro, FileText, CheckCircle, 
  Share2, Save, ExternalLink, StickyNote 
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // CRUCIAL : Sur Next.js 15, on doit await les params pour récupérer l'ID
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id: id },
    include: { client: true, tasks: true }
  });

  if (!project) notFound();

  // Calcul du budget consommé
  const consumptionPercent = project.value > 0 ? Math.min(Math.round((project.budget / project.value) * 100), 100) : 0;

  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh', padding: '40px', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* NAVIGATION RETOUR */}
        <Link href="/projects" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '30px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Retour au Kanban
        </Link>

        <form action={updateProjectAction}>
          {/* Identifiant caché pour l'action Prisma */}
          <input type="hidden" name="projectId" value={project.id} />

          {/* EN-TÊTE DYNAMIQUE */}
          <div style={{ backgroundColor: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                   <span style={{ backgroundColor: '#3b82f6', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                     {project.type}
                   </span>
                   <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>#{project.id.slice(-6)}</span>
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>{project.title}</h1>
                <p style={{ color: '#64748b', marginTop: '5px' }}>Client : <strong>{project.client?.name || "Direct"}</strong></p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                 <button type="submit" style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Save size={18} /> Enregistrer
                 </button>
              </div>
            </div>
          </div>

          {/* GRILLE DE PERSONNALISATION */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* BRIEF TECHNIQUE */}
              <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#6366f1' }}>
                  <StickyNote size={18} /> Brief & Description du projet
                </h3>
                <textarea 
                  name="description" 
                  defaultValue={project.description || ""} 
                  placeholder="Décrivez ici les attentes du client..."
                  style={{ width: '100%', minHeight: '180px', backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '15px', padding: '20px', color: '#94a3b8', outline: 'none', fontSize: '14px', lineHeight: '1.6' }}
                />
              </div>

              {/* NOTES PRIVÉES */}
              <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#6366f1' }}>Notes de Production (Privées)</h3>
                <textarea 
                  name="notes" 
                  defaultValue={project.notes || ""} 
                  placeholder="Codes d'accès, consignes équipe, secrets techniques..."
                  style={{ width: '100%', minHeight: '100px', backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '15px', padding: '20px', color: '#94a3b8', outline: 'none', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* BUSINESS & BUDGET */}
              <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Rentabilité</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '900' }}>{consumptionPercent}%</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>utilisé</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#1f2937', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ width: `${consumptionPercent}%`, height: '100%', backgroundColor: consumptionPercent > 85 ? '#ef4444' : '#10b981' }}></div>
                </div>
                
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>BUDGET ALLOUÉ (€)</label>
                <input 
                  name="budget" 
                  type="number" 
                  defaultValue={project.budget}
                  style={{ width: '100%', backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '10px', padding: '12px', color: 'white', fontWeight: 'bold' }}
                />
                <p style={{ marginTop: '15px', fontSize: '12px', color: '#475569' }}>Valeur contrat : {project.value.toLocaleString()} €</p>
              </div>

              {/* LIEN CLOUD */}
              <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Lien de production</h3>
                <input 
                  name="driveLink" 
                  type="url" 
                  defaultValue={project.driveLink || ""}
                  placeholder="Google Drive, Figma, Notion..."
                  style={{ width: '100%', backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '10px', padding: '12px', color: 'white', marginBottom: '12px' }}
                />
                {project.driveLink && (
                  <a href={project.driveLink} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                    <ExternalLink size={14} /> Ouvrir le dossier externe
                  </a>
                )}
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}