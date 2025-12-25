"use client"; // <--- C'est ça qui rend le onClick possible

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
    >
      <Printer size={18} /> Imprimer / PDF
    </button>
  );
}