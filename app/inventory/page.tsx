import { prisma } from "../lib/prisma";
import { createInventoryItem, borrowItem, returnItem } from "@/app/actions";
import { Box, Camera, Ruler, User, RotateCcw, Plus } from "lucide-react";

export default async function InventoryPage() {
  const items = await prisma.inventoryItem.findMany({ orderBy: { category: 'asc' } });
  const users = await prisma.user.findMany({ select: { name: true } });

  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh', padding: '40px', color: 'white' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '50px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>Parc Matériel</h1>
          <p style={{ color: '#64748b', fontSize: '18px', marginTop: '10px' }}>Gestion de l'équipement et des emprunts</p>
        </header>

        {/* AJOUT RAPIDE */}
        <div style={{ backgroundColor: '#141416', padding: '25px', borderRadius: '24px', border: '1px solid #1f2937', marginBottom: '40px' }}>
          <form action={createInventoryItem} style={{ display: 'flex', gap: '15px' }}>
            <input name="name" placeholder="Nom du matériel (ex: Sony A7IV)" required style={{ backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px', color: 'white', flex: 2, outline: 'none' }} />
            <select name="category" style={{ backgroundColor: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px', color: 'white', flex: 1, outline: 'none' }}>
              <option value="Media">Pôle Média</option>
              <option value="Archi">Pôle Architecture</option>
              <option value="Informatique">Informatique</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 25px', fontWeight: 'bold', cursor: 'pointer' }}>
              <Plus size={18} />
            </button>
          </form>
        </div>

        {/* LISTE DU MATÉRIEL */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ 
              backgroundColor: '#141416', 
              padding: '25px', 
              borderRadius: '24px', 
              border: '1px solid #1f2937',
              borderTop: item.status === 'BORROWED' ? '4px solid #f59e0b' : '4px solid #10b981'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ color: item.category === 'Media' ? '#a855f7' : '#3b82f6' }}>
                  {item.category === 'Media' ? <Camera size={24}/> : <Ruler size={24}/>}
                </div>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: '900', 
                  backgroundColor: item.status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: item.status === 'AVAILABLE' ? '#10b981' : '#f59e0b',
                  padding: '5px 10px',
                  borderRadius: '6px'
                }}>
                  {item.status}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{item.name}</h3>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '20px' }}>{item.category}</p>

              {item.status === 'BORROWED' ? (
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '15px', marginBottom: '15px' }}>
                   <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <User size={14}/> Détenu par : <strong>{item.borrower}</strong>
                   </p>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#475569', marginBottom: '15px' }}>Disponible.</p>
              )}

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {item.status === 'AVAILABLE' ? (
                  <form action={async (formData) => {
                    "use server";
                    const user = formData.get("user") as string;
                    await borrowItem(item.id, user);
                  }} style={{ display: 'flex', width: '100%', gap: '10px' }}>
                    <select name="user" style={{ flex: 1, backgroundColor: '#1c1c1f', border: '1px solid #1f2937', color: 'white', borderRadius: '10px', fontSize: '12px' }}>
                      {users.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                    </select>
                    <button type="submit" style={{ backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '10px', padding: '8px 15px', fontSize: '12px', fontWeight: 'bold' }}>
                      Prêter
                    </button>
                  </form>
                ) : (
                  <form action={async () => {
                    "use server";
                    await returnItem(item.id);
                  }} style={{ width: '100%' }}>
                    <button type="submit" style={{ width: '100%', backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151', borderRadius: '10px', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                      Marquer comme rendu
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}