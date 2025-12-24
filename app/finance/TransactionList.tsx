"use client";

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { createTransaction } from '../actions';

type Transaction = {
  id: number;
  label: string;
  amount: number;
  type: string;
  entity: string;
  category: string;
  date: Date;
};

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calcul du solde total en temps réel
  const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* MODALE D'AJOUT */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Transaction">
        <form action={async (formData) => { await createTransaction(formData); setIsModalOpen(false); }} className="space-y-4">
           <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Libellé</label>
              <input name="label" required placeholder="ex: Facture Client X" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Montant (€)</label>
                <input name="amount" type="number" step="0.01" required placeholder="1000" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                <select name="type" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors">
                   <option value="income">🟢 Recette (+)</option>
                   <option value="expense">🔴 Dépense (-)</option>
                </select>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Entité</label>
                <select name="entity" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors">
                   <option value="ARCHI">Cobalt Archi</option>
                   <option value="ATELIER">L'Atelier</option>
                   <option value="SCI">Patrimoine</option>
                   <option value="ASSO">Association</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Catégorie</label>
                <input name="category" placeholder="ex: Honoraires" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" />
             </div>
           </div>

           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Enregistrer</button>
        </form>
      </Modal>

      {/* HEADER AVEC SOLDE */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Finance & Trésorerie</h1>
           <p className="text-gray-500 mt-1">Suivi des flux financiers</p>
        </div>
        
        {/* Carte Solde */}
        <div className="flex items-center gap-4 bg-[#141416] border border-white/10 px-6 py-3 rounded-2xl">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500"><Wallet size={24} /></div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Solde Actuel</p>
                <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-white' : 'text-red-500'}`}>
                    {totalBalance.toLocaleString()} €
                </p>
            </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
           <Plus size={18} /> <span>Transaction</span>
        </button>
      </div>

      {/* LISTE DES TRANSACTIONS */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
            <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">Aucune transaction enregistrée.</div>
        ) : (
            transactions.map((t) => (
                <Card key={t.id} className="flex items-center justify-between p-4 group hover:bg-[#141416] transition-colors border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{t.label}</h4>
                            <div className="flex gap-2 text-xs text-gray-500">
                                <span>{new Date(t.date).toLocaleDateString()}</span> • 
                                <span className="text-blue-400 font-bold">{t.entity}</span> • 
                                <span>{t.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                        {t.type === 'income' ? '+' : ''}{t.amount.toLocaleString()} €
                    </div>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}