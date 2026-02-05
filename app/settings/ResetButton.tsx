"use client";

import { useState } from "react";
import { resetDatabase } from "@/app/actions/system";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export function ResetButton() {
  const [status, setStatus] = useState<'IDLE' | 'CONFIRM' | 'LOADING'>('IDLE');

  const handleReset = async () => {
    setStatus('LOADING');
    try {
      await resetDatabase();
      // On force un rechargement complet pour vider les caches clients
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Erreur : Impossible de réinitialiser (Vérifiez que vous n'êtes pas en Production)");
      setStatus('IDLE');
    }
  };

  if (status === 'CONFIRM') {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3 animate-in fade-in slide-in-from-right-5 bg-red-900/10 p-4 rounded-xl border border-red-900/30">
        <span className="text-xs font-bold text-red-400 uppercase flex-1 text-center sm:text-left">
            ⚠️ Irréversible : Tout effacer ?
        </span>
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
            onClick={() => setStatus('IDLE')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gray-800 text-white text-xs font-bold hover:bg-gray-700 transition-colors"
            >
            Annuler
            </button>
            <button 
            onClick={handleReset}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 flex items-center justify-center gap-2 transition-colors"
            >
            <Trash2 size={14} /> Confirmer
            </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setStatus('CONFIRM')}
      disabled={status === 'LOADING'}
      className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {status === 'LOADING' ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} className="group-hover:scale-110 transition-transform" />}
      {status === 'LOADING' ? 'Nettoyage en cours...' : 'Réinitialiser la Base de Données'}
    </button>
  );
}