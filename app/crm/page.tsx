import { prisma } from "../lib/prisma";
import { createClient, deleteClient } from "@/app/actions/crm";
import { 
  Briefcase, UserPlus, Search, Building2, User, 
  Mail, Trash2, Landmark
} from "lucide-react"; // J'ai ajouté Landmark pour le Public

export default async function CRMPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { invoices: true }
  });

  // Petite fonction pour déterminer le style selon le type
  const getClientStyle = (type: string) => {
    // CAS 1 : MARCHÉ PUBLIC
    if (['PUBLIC', 'MAIRIE', 'COLLECTIVITE'].includes(type)) {
      return { 
        style: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500', 
        icon: Landmark 
      };
    }
    // CAS 2 : PARTICULIER
    if (type === 'PARTICULIER') {
      return { 
        style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', 
        icon: User 
      };
    }
    // CAS 3 : TOUT LE RESTE (Entreprises, PME, TPE, Asso...)
    return { 
      style: 'bg-blue-500/10 border-blue-500/20 text-blue-500', 
      icon: Building2 
    };
  };

  return (
    <div className="space-y-8 fade-in">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="text-pink-500" /> Carnet Clients
          </h1>
          <p className="text-gray-400">Répertoire des maîtres d'ouvrages et partenaires.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{clients.length}</p>
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Contacts</p>
        </div>
      </div>

      {/* FORMULAIRE D'AJOUT */}
      <div className="bg-[#141416] p-6 rounded-2xl border border-white/10">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <UserPlus size={16} /> Nouveau Contact
        </h3>
        
        <form action={createClient} className="flex flex-col xl:flex-row gap-4 items-end">
          
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] uppercase font-bold text-gray-500">Nom / Raison Sociale</label>
            <input name="name" placeholder="Ex: Mairie de Bordeaux, Mme Dupont..." required className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pink-500" />
          </div> 
        
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] uppercase font-bold text-gray-500">Email</label>
            <input name="email" type="email" placeholder="contact@client.com" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pink-500" />
          </div>

          <div className="w-full md:w-48 space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500">Type de structure</label>
            <select name="type" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pink-500">
              <optgroup label="Personnes">
                <option value="PARTICULIER">Particulier</option>
              </optgroup>
              <optgroup label="Entreprises">
                <option value="TPE">TPE / Artisan</option>
                <option value="PME">PME</option>
                <option value="ENTREPRISE">Grande Entreprise</option>
                <option value="SCI">SCI</option>
              </optgroup>
              <optgroup label="Institutionnel">
                <option value="PUBLIC">Marché Public / Mairie</option>
                <option value="ASSOCIATION">Association</option>
              </optgroup>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          {/* CHECKBOXES ENTITÉS */}
          <div className="flex flex-col space-y-1">
             <label className="text-[10px] uppercase font-bold text-gray-500">Lier à</label>
             <div className="flex gap-3 items-center h-[38px] px-3 bg-white/5 rounded-lg border border-white/5">
                <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer hover:text-white">
                  <input type="checkbox" name="entities" value="ARCHI" defaultChecked className="accent-blue-500"/> Archi
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer hover:text-white">
                  <input type="checkbox" name="entities" value="ATELIER" className="accent-orange-500"/> Atelier
                </label>
             </div>
          </div>

          <button type="submit" className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors h-[38px]">
            Ajouter
          </button>
        </form>
      </div>

      {/* TABLEAU DES CLIENTS */}
      <div className="bg-[#141416] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/40 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
              <th className="p-4 pl-6">Nom</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Entités</th>
              <th className="p-4 text-right">Factures</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map((client) => {
              const visual = getClientStyle(client.type);
              const Icon = visual.icon;

              return (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                  
                  {/* NOM + TYPE */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${visual.style}`}>
                        <Icon size={18}/>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{client.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{client.type}</p>
                      </div>
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="p-4">
                    {client.email ? (
                      <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <Mail size={14} /> {client.email}
                      </a>
                    ) : (
                      <span className="text-gray-700 text-xs italic">Non renseigné</span>
                    )}
                  </td>

                  {/* ENTITÉS LIÉES */}
                  <td className="p-4">
                    <div className="flex gap-1">
                      {client.entity.split(',').filter(Boolean).map(ent => (
                        <span key={ent} className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border border-white/5 ${
                           ent === 'ARCHI' ? 'bg-blue-900/20 text-blue-400' : 
                           ent === 'ATELIER' ? 'bg-orange-900/20 text-orange-400' : 'bg-gray-800 text-gray-500'
                        }`}>
                          {ent}
                        </span>
                      ))}
                      {(!client.entity || client.entity === 'GLOBAL') && <span className="text-[9px] text-gray-600">GLOBAL</span>}
                    </div>
                  </td>

                  {/* FACTURES */}
                  <td className="p-4 text-right">
                    {client.invoices.length > 0 ? (
                      <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-1 rounded border border-white/5">
                        {client.invoices.length} factures
                      </span>
                    ) : (
                      <span className="text-xs text-gray-700">-</span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 text-right">
                    <form action={deleteClient.bind(null, client.id)}>
                      <button className="text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100">
                        <Trash2 size={16}/>
                      </button>
                    </form>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}