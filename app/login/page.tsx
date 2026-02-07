"use client";

import { useActionState } from "react"; // Nouvelle méthode React 19/Next 14+
import { loginAction } from "@/app/actions/auth";
import { Loader2, Command } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* LOGO */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-white/10">
            <Command className="text-black" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Cobalt OS</h1>
          <p className="text-gray-500 mt-2 text-sm">Veuillez vous identifier pour accéder au système.</p>
        </div>

        {/* FORMULAIRE */}
        <form action={formAction} className="bg-[#141416] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Professionnel</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="admin@cobalt.com"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mot de passe</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* MESSAGE D'ERREUR */}
          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-medium">
              {state.error}
            </div>
          )}

          <button 
            disabled={isPending}
            type="submit" 
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="animate-spin" size={20}/> : "Connexion"}
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-600">
          Système privé réservé aux membres du Collectif Cobalt.
        </p>
      </div>
    </div>
  );
}