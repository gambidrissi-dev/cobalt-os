"use client";

import React, { useState, useTransition } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateProjectStatus } from '@/app/actions';
import Link from 'next/link';

// --- COMPOSANT COLONNE (DROPPABLE) ---
function KanbanColumn({ id, title, color, children, count }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className={`flex flex-col gap-4 p-2 rounded-2xl transition-colors ${isOver ? 'bg-white/5' : 'bg-transparent'}`}>
      <div className={`flex items-center justify-between ${color} font-black px-2 uppercase text-[10px] tracking-widest`}>
        <span>{title}</span>
        <span className="bg-white/5 px-2 py-0.5 rounded-full text-white border border-white/10">{count}</span>
      </div>
      <div className="space-y-3 min-h-[500px]">
        {children}
      </div>
    </div>
  );
}

// --- COMPOSANT CARTE (SORTABLE) ---
function SortableProjectCard({ project }: { project: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/projects/${project.id}`} className="block no-underline pointer-events-none">
        <div className={`bg-[#141416] p-4 rounded-xl border border-white/5 hover:border-blue-500/50 transition-all border-l-4 ${
          project.status === 'TODO' ? 'border-l-gray-500' : project.status === 'IN_PROGRESS' ? 'border-l-blue-500' : 'border-l-emerald-500'
        }`}>
          <h3 className="font-medium text-white text-sm">{project.title}</h3>
          <p className="text-[10px] text-gray-500 mt-2">{project.value.toLocaleString()} €</p>
        </div>
      </Link>
    </div>
  );
}

// --- LE TABLEAU ---
export default function KanbanBoard({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { 
    activationConstraint: { distance: 5 } 
  }));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    // L'ID du container de destination (ex: "TODO")
    const newStatus = over.id as string;
    const projectToUpdate = projects.find(p => p.id === active.id);

    if (projectToUpdate && projectToUpdate.status !== newStatus) {
      // 1. Mise à jour visuelle forcée
      const newProjects = projects.map(p => 
        p.id === active.id ? { ...p, status: newStatus } : p
      );
      setProjects(newProjects);

      // 2. Sauvegarde BDD
      startTransition(async () => {
        await updateProjectStatus(active.id, newStatus);
      });
    }
  };

  const COLUMNS = [
    { id: 'TODO', title: 'À faire', color: 'text-gray-400' },
    { id: 'IN_PROGRESS', title: 'En cours', color: 'text-blue-400' },
    { id: 'DONE', title: 'Terminé', color: 'text-emerald-400' },
  ];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col.id} 
            id={col.id} 
            title={col.title} 
            color={col.color}
            count={projects.filter(p => p.status === col.id).length}
          >
            <SortableContext items={projects.filter(p => p.status === col.id).map(p => p.id)} strategy={verticalListSortingStrategy}>
              {projects.filter(p => p.status === col.id).map(p => (
                <SortableProjectCard key={p.id} project={p} />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
    </DndContext>
  );
}