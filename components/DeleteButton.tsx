"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteButton({ id, action }: { id: string, action: (id: string) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Pour ne pas ouvrir le projet par erreur
    if (confirm("Supprimer définitivement cet élément ?")) {
      startTransition(async () => {
        await action(id);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  );
}
