import { prisma } from "@/app/lib/prisma";
import { getActiveEntity } from "@/app/actions/auth";

export async function findManySafe<T>(model: any, options: any = {}) {
  const entity = await getActiveEntity();
  const entityFilter = entity === 'GLOBAL' ? {} : { entity };
  const safeWhere = { ...options.where, ...entityFilter };
  return model.findMany({
    where: safeWhere,
    select: options.select,
    orderBy: options.orderBy,
    take: options.take,
  });
}

export async function countSafe(model: any, where: any = {}) {
  const entity = await getActiveEntity();
  const entityFilter = entity === 'GLOBAL' ? {} : { entity };
  return model.count({ where: { ...where, ...entityFilter } });
}
