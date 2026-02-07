"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/auth";

export async function uploadFile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const file = formData.get("file") as File;
  const isPublic = formData.get("isPublic") === "on";
  if (!file || file.size === 0) return;
  await prisma.file.create({
    data: { name: file.name, size: file.size, mimeType: file.type, path: "/uploads/" + file.name, isPublic: isPublic, ownerId: user.id }
  });
  revalidatePath("/media/assets");
}

export async function deleteFile(id: string) {
    await prisma.file.delete({ where: { id } });
    revalidatePath("/media/assets");
}
