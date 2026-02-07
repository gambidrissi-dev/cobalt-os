import { prisma } from "../lib/prisma";
import { getActiveEntity } from "../actions/auth";
import ProjectList from "./ProjectList";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const entityStr = await getActiveEntity();
  if (entityStr === 'GLOBAL') redirect('/');
  const projects = await prisma.project.findMany({ where: { entity: entityStr }, orderBy: { createdAt: 'desc' } });
  const serializedProjects = projects.map(p => ({
    ...p, dueDate: p.dueDate ? p.dueDate.toISOString() : null, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(), progress: 0, color: '', phase: 'ESQ'
  }));
  return <ProjectList initialProjects={serializedProjects} currentEntity={entityStr} />;
}
