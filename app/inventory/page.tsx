import { prisma } from "../lib/prisma";
import { getActiveEntity } from "../actions/auth";
import { createItem, deleteItem, borrowItem, returnItem } from "@/app/actions/inventory";
import { 
  Plus, Camera, Ruler, Wrench, Trash2, RotateCcw, PackageOpen
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function InventoryPage() {
  const entityStr = await getActiveEntity();

  // SÉCURITÉ : Le Global est réservé au Dashboard/RH.
  // L'inventaire est géré dans les espaces opérationnels (ex: Média).
  if (entityStr === 'GLOBAL') {
     redirect('/');
  }

  // On récupère TOUT le matériel (pas de 'where' condition sur l'entité)
  const [items, users] = await Promise.all([
    prisma.inventoryItem.findMany({
      orderBy: { status: 'asc' }, 
      include: { borrower: true }
    }),
    prisma.user.findMany({ orderBy: { name: 'asc' } })
  ]);

  const getIcon = (category: string) => {
    if (category === 'Camera') return <Camera size={24} className="text-purple-500"/>;
    if (category === 'Mesure') return <Ruler size={24} className="text-blue-500"/>;
    return <Wrench size={24} className="text-orange-500"/>;
  };

  return (
    <div className="space-y-8 fade-in">
      
      {/* HEADER CENTRALISÉ */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white/10 rounded-lg"><PackageOpen size={20} className="text-white"/></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">ESPACE GROUPE</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inventaire Centralisé</h1>
          <p className="text-gray-400">Gestion de l'ensemble du parc matériel du Collectif.</p>
        </div>

        <div className="bg-[#141416] p-2 rounded-xl border border-white/10 w-full md:w-auto">
          <form action={createItem} className="flex gap-2">
            <input 
              name="name" 
              placeholder="Nouvel équipement..." 
              required
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-white/30 outline-none w-full md:w-64"
            />
            <select name="category" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
              <option value="Outillage" className="bg-black">Outillage</option>
              <option value="Camera" className="bg-black">Caméra / Média</option>
              <option value="Mesure" className="bg-black">Mesure / Laser</option>
              <option value="Informatique" className="bg-black">Informatique</option>
            </select>
            <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors">
              <Plus size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* GRILLE MATÉRIEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {items.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">
            Le parc matériel est vide. Ajoutez des objets via le formulaire ci-dessus.
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className={`bg-[#141416] p-5 rounded-2xl border transition-all group relative ${
            item.status === 'BORROWED' ? 'border-orange-500/20' : 'border-white/5 hover:border-white/20'
          }`}>
            
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                {getIcon(item.category)}
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                item.status === 'BORROWED' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}>
                {item.status === 'BORROWED' ? 'Emprunté' : 'Dispo'}
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 truncate">{item.name}</h3>
            <div className="flex justify-between items-center mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest">{item.category}</p>
                {/* On affiche à qui appartient l'objet à la base (Archi, Atelier...) si tu veux garder la traçabilité */}
                <span className="text-[9px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{item.entity}</span>
            </div>

            {item.status === 'BORROWED' ? (
              <div className="bg-orange-500/5 rounded-xl p-3 border border-orange-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-black text-xs">
                    {item.borrower?.name?.charAt(0) || "?"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-400">Détenteur</p>
                    <p className="text-sm font-bold text-white truncate">{item.borrower?.name || "Inconnu"}</p>
                  </div>
                </div>
                
                <form action={returnItem.bind(null, item.id)}>
                  <button className="w-full py-2 bg-orange-500 text-black text-xs font-bold rounded-lg hover:bg-orange-400 transition-colors flex items-center justify-center gap-2">
                    <RotateCcw size={14}/> Retour Stock
                  </button>
                </form>
              </div>
            ) : (
              <form action={borrowItem} className="flex gap-2">
                <input type="hidden" name="itemId" value={item.id} />
                <select name="borrowerName" required className="flex-1 bg-black border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-white/30">
                  <option value="">Assigner à...</option>
                  {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
                <button type="submit" className="bg-white text-black px-3 rounded-lg hover:bg-gray-200 text-xs font-bold">OK</button>
              </form>
            )}

            <form action={deleteItem.bind(null, item.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </form>

          </div>
        ))}
      </div>
    </div>
  );
}