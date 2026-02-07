"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/auth";

export async function createSocialPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const content = formData.get("content") as string;
  const platform = formData.get("platform") as string;
  const scheduledFor = formData.get("scheduledFor") as string;
  await prisma.socialPost.create({
    data: { content, platform, status: "DRAFT", scheduledFor: scheduledFor ? new Date(scheduledFor) : null, authorId: user.id }
  });
  revalidatePath("/media/calendar");
}

export async function saveScript(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  await prisma.mediaScript.create({
    data: { title, content, status: "DRAFT", authorId: user.id }
  });
  revalidatePath("/media/studio");
}
