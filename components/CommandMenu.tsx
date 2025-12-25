"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { 
  Search, FolderKanban, Users, FileText, 
  BookOpen, Package, Command as CommandIcon 
} from "lucide-react";
import { globalSearch, SearchResult } from "@/app/actions/search";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  // Raccourci Clavier (CMD+K ou CTRL+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Logique de recherche avec délai (Debounce)
  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await globalSearch(query);
      setResults(data);
      setLoading(false);
    }, 300); // On attend 300ms après la frappe

    return () => clearTimeout(timer);
  }, [query]);

  // Fonction de navigation
  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // Icône dynamique
  const getIcon = (type: string) => {
    switch (type) {
      case "PROJECT": return <FolderKanban size={14} className="text-blue-500" />;
      case "CLIENT": return <Users size={14} className="text-purple-500" />;
      case "INVOICE": return <FileText size={14} className="text-green-500" />;
      case "WIKI": return <BookOpen size={14} className="text-yellow-500" />;
      case "ITEM": return <Package size={14} className="text-orange-500" />;
      default: return <Search size={14} />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm fade-in" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-lg bg-[#141416] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Recherche Globale" className="w-full">
          
          <div className="flex items-center px-4 py-3 border-b border-white/5">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <Command.Input 
              value={query}
              onValueChange={setQuery}
              placeholder="Rechercher un projet, client, facture..." 
              className="w-full bg-transparent text-white placeholder:text-gray-600 outline-none text-sm font-medium"
              autoFocus
            />
            <div className="flex items-center gap-1 text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded border border-white/5">
              <span className="text-xs">ESC</span>
            </div>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
            
            {/* Message vide */}
            {!loading && query.length > 1 && results.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-500">
                Aucun résultat trouvé pour "{query}".
              </div>
            )}
            
            {/* Message initial */}
            {query.length === 0 && (
              <div className="py-8 text-center">
                 <CommandIcon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                 <p className="text-gray-500 text-xs">Tapez pour naviguer dans Cobalt OS</p>
              </div>
            )}

            {/* Résultats */}
            {results.map((item) => (
              <Command.Item
                key={`${item.type}-${item.id}`}
                onSelect={() => runCommand(() => router.push(item.url))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
              >
                <div className="p-2 bg-white/5 rounded-md border border-white/5">
                  {getIcon(item.type)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{item.title}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">{item.subtitle}</span>
                </div>
                
                <span className="ml-auto text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 border border-white/5">
                   {item.type}
                </span>
              </Command.Item>
            ))}

          </Command.List>
        </Command>
      </div>
    </div>
  );
}