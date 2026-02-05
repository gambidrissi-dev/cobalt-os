import { prisma } from "../lib/prisma";
import { getActiveEntity } from "../actions/auth";
import ProjectList from "./ProjectList";

export default async function ProjectsPage() {
  const entityStr = await getActiveEntity();
  const whereCondition = entityStr === 'GLOBAL' ? {} : { entity: entityStr };

  const projects = await prisma.project.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' }
  });

  // SÉRIALISATION : On convertit les dates en string pour le composant Client
  const serializedProjects = projects.map(p => ({
    ...p,
    dueDate: p.dueDate ? p.dueDate.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    // Champs UI par défaut
    progress: 0,
    color: '',
    phase: 'ESQ'
  }));

  return (
    <ProjectList initialProjects={serializedProjects} />
  );
}