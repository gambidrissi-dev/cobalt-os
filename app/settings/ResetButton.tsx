"use client";

import { useState } from "react";
import { resetDatabase } from "@/app/actions"; // L'import fonctionnera maintenant !
import { Trash2, Loader2 } from "lucide-react";

export function ResetButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm("⚠️ Êtes-vous SÛR de vouloir tout effacer ? Cette action est irréversible.")) return;
    
    setIsLoading(true);
    await resetDatabase();
    setIsLoading(false);
    
    alert("Base de données remise à zéro !");
  };

  return (
    <button 
      onClick={handleReset} 
      disabled={isLoading}
      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      {isLoading ? "Nettoyage en cours..." : "Réinitialiser la Base de Données"}
    </button>
  );
}