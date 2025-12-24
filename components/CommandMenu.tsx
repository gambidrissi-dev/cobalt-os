"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Calculator, LayoutDashboard, Briefcase, Box } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

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

  const run = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Menu de commande"
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
    >
      <div className="w-full max-w-lg bg-[#141416] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 border-b border-white/10">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <Command.Input 
            placeholder="Que cherchez-vous ?" 
            className="w-full bg-transparent py-4 text-white outline-none placeholder:text-gray-600 text-lg"
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-gray-500 text-sm">
            Aucun résultat.
          </Command.Empty>

          <Command.Group heading="Navigation" className="text-xs text-gray-500 font-bold px-2 py-2 uppercase text-gray-400">
            <Item icon={LayoutDashboard} text="Tableau de bord" onSelect={() => run("/")} />
            <Item icon={Briefcase} text="Projets" onSelect={() => run("/projects")} />
            <Item icon={Calculator} text="Factures" onSelect={() => run("/finance")} />
            <Item icon={Box} text="Inventaire" onSelect={() => run("/inventory")} />
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}

function Item({ icon: Icon, text, onSelect }: any) {
  return (
    <Command.Item 
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-blue-600 hover:text-white cursor-pointer transition-all data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{text}</span>
    </Command.Item>
  );
}