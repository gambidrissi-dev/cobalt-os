"use client";

import { useState, useEffect } from "react";
import TiptapEditor from "@/components/TiptapEditor";
import { saveWikiPage } from "@/app/actions/wiki";
import { Save, Loader2 } from "lucide-react";

export default function WikiEditorClient({ page }: { page: any }) {
  const [content, setContent] = useState(page.content);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mettre à jour si on change de page
  useEffect(() => {
    setContent(page.content);
    setHasUnsavedChanges(false);
  }, [page.id]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveWikiPage(page.id, content);
    setIsSaving(false);
    setHasUnsavedChanges(false);
  };

  // Sauvegarde auto (Ctrl+S)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [content]);

  return (
    <div className="flex flex-col h-full">
      {/* HEADER DE LA PAGE */}
      <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#141416]">
        <input 
          defaultValue={page.title}
          className="bg-transparent text-3xl font-black text-white outline-none w-full placeholder:text-gray-700"
          placeholder="Titre de la page..."
          // Pour faire simple, on ne sauvegarde pas le titre ici en temps réel, 
          // mais tu pourrais ajouter une action updateTitle
        />
        
        <button 
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            hasUnsavedChanges 
              ? 'bg-blue-600 text-white hover:bg-blue-500' 
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />}
          {isSaving ? 'Enreg...' : hasUnsavedChanges ? 'Sauvegarder' : 'Enregistré'}
        </button>
      </div>

      {/* ÉDITEUR */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <TiptapEditor 
            content={content} 
            onChange={(newContent) => {
              setContent(newContent);
              setHasUnsavedChanges(true);
            }} 
          />
        </div>
      </div>
    </div>
  );
}