import { prisma } from "../lib/prisma";
import { createUser } from "@/app/actions";
import { UserPlus, Mail, Shield, Users, Arches, Camera } from "lucide-react";

export default async function HRPage() {
  const team = await prisma.user.findMany({ orderBy: { name: 'asc' } });

  // Statistiques rapides
  const totalMembers = team.length;
  const admins = team.filter(u => u.role === 'admin').length;
  const experts = team.length - admins;

  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh', padding: '40px', color: 'white' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER & STATS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
          <div>
            <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Ressources Humaines</h1>
            <p style={{ color: '#64748b', fontSize: '18px', marginTop: '10px' }}>Effectif et talents du collectif Cobalt</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>TOTAL</p>
              <h4 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>{totalMembers}</h4>
            </div>
            <div style={{ textAlign: 'right', borderLeft: '1px solid #1f2937', paddingLeft: '20px' }}>
              <p style={{ color: '#4f46e5', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>ADMINS</p>
              <h4 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>{admins}</h4>
            </div>
          </div>
        </div>

        {/* --- FORMULAIRE D'AJOUT V2 --- */}
        <div style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '24px', border: '1px solid #1f2937', marginBottom: '50px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={18} color="#4f46e5" /> Intégrer un nouveau collaborateur
          </h3>
          <form action={createUser} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input name="name" type="text" placeholder="Prénom Nom" required style={{ backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 20px', color: 'white', flex: 1, fontSize: '14px', outline: 'none' }} />
            <input name="email" type="email" placeholder="Email professionnel" required style={{ backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 20px', color: 'white', flex: 1, fontSize: '14px', outline: 'none' }} />
            <select name="role" style={{ backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 20px', color: 'white', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
              <option value="archi">Pôle Architecture</option>
              <option value="media">Pôle Média</option>
              <option value="admin">Administrateur</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 30px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>
              Ajouter au collectif
            </button>
          </form>
        </div>

        {/* --- GRILLE DES TALENTS --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {team.map((user) => (
            <div key={user.id} style={{ backgroundColor: '#141416', padding: '30px', borderRadius: '28px', border: '1px solid #1f2937', transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '20px', 
                  backgroundColor: user.role === 'admin' ? '#ef4444' : user.role === 'archi' ? '#3b82f6' : '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div style={{ 
                  padding: '5px 12px', 
                  borderRadius: '8px', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {user.role}
                </div>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{user.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                <Mail size={14} /> {user.email}
              </div>

              <div style={{ borderTop: '1px solid #1f2937', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>COBALT OPERATOR</span>
                <Shield size={16} color={user.role === 'admin' ? '#ef4444' : '#475569'} />
              </div>
            </div>
          ))}
        </div>

        {team.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px', color: '#475569' }}>
            <Users size={48} style={{ marginBottom: '20px', opacity: 0.2 }} />
            <p>Aucun membre n'a encore rejoint le collectif.</p>
          </div>
        )}

      </div>
    </div>
  );
}