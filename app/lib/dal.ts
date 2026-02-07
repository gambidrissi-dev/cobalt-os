import { prisma } from "@/app/lib/prisma";
import { getActiveEntity } from "@/app/actions/auth";

/**
 * DATA ACCESS LAYER (DAL)
 * "Middleware" de base de données pour Cobalt OS.
 * 
 * Rôles :
 * 1. Sécurité : Force le filtrage par `entity` (company_id).
 * 2. Eco-conception : Encourage l'usage de `select` pour réduire la RAM.
 */

// Type générique pour les modèles Prisma (Project, Invoice, etc.)
type PrismaModel = any; 

export async function findManySafe<T>(
  model: PrismaModel, 
  options: { 
    where?: any, 
    select?: any, // <--- OBLIGATOIRE pour l'éco-conception (si possible)
    orderBy?: any,
    take?: number 
  } = {}
) {
  const entity = await getActiveEntity();
  
  // Si on est en GLOBAL, on voit tout (ou logique d'agrégation spécifique)
  // Sinon, on force le filtre sur l'entité courante
  const entityFilter = entity === 'GLOBAL' ? {} : { entity };

  // Fusion des filtres de sécurité et des filtres demandés
  const safeWhere = {
    ...options.where,
    ...entityFilter
  };

  // Exécution optimisée
  return model.findMany({
    where: safeWhere,
    select: options.select, // On ne récupère que les colonnes nécessaires (RAM friendly)
    orderBy: options.orderBy,
    take: options.take,
  });
}

export async function countSafe(model: PrismaModel, where: any = {}) {
  const entity = await getActiveEntity();
  const entityFilter = entity === 'GLOBAL' ? {} : { entity };
  return model.count({
    where: { ...where, ...entityFilter }
  });
}