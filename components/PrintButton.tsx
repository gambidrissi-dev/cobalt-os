"use client"; // Indispensable pour utiliser onClick

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg"
    >
      <Printer size={18} /> Imprimer / PDF
    </button>
  );
}