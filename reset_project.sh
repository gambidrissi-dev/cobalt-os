#!/bin/bash

# Vérification pré-requise : Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ ERREUR : Node.js (npm) est introuvable."
    echo "👉 Veuillez installer Node.js depuis https://nodejs.org/ avant de lancer ce script."
    exit 1
fi

echo "🔥 NETTOYAGE EN COURS..."
rm -rf app components prisma/schema.prisma
# On garde node_modules, .env, package.json, etc.

echo "🏗️ RECONSTRUCTION DE L'ARBORESCENCE..."
mkdir -p app/actions
mkdir -p app/api/dashboard/global
mkdir -p app/api/dashboard/me
mkdir -p app/api/v1/status
mkdir -p app/finance
mkdir -p app/hr
mkdir -p app/inventory
mkdir -p app/lib
mkdir -p app/login
mkdir -p app/media/analytics
mkdir -p app/media/assets
mkdir -p app/media/calendar
mkdir -p app/media/publish
mkdir -p app/media/studio
mkdir -p app/projects/[id]
mkdir -p app/settings
mkdir -p app/timesheet
mkdir -p components/dashboard
mkdir -p components/ui
mkdir -p components/widgets
mkdir -p prisma

echo "📝 ÉCRITURE DES FICHIERS..."

# --- CONFIGURATION PRISMA ---

cat << 'EOF' > prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- CORE MODELS ---

model User {
  id              String    @id @default(cuid())
  name            String
  email           String    @unique
  password        String
  role            String    // 'admin' | 'guest'
  job             String?
  title           String?
  avatar          String?
  allowedEntities String?   // ex: "ARCHI,ATELIER"
  
  organizationId  String?
  organization    Company?  @relation("UserOrganization", fields: [organizationId], references: [id])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  projects        Project[]
  tasks           Task[]
  timeLogs        TimeLog[]
  files           File[]    @relation("FileOwner")
  inventory       InventoryItem[]
  mediaScripts    MediaScript[]
  socialPosts     SocialPost[]
  reservations    Reservation[]
}

model Company {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  logo        String?
  balance     Float    @default(0)
  isCollective Boolean @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  primaryUsers User[]   @relation("UserOrganization")
  projects    Project[]
  files       File[]
  invoices    Invoice[]
  clients     Client[]
  txFrom      Transaction[] @relation("TxFrom")
  txTo        Transaction[] @relation("TxTo")
}

model Transaction {
  id          String   @id @default(cuid())
  amount      Float
  description String
  date        DateTime @default(now())
  fromId      String?
  from        Company? @relation("TxFrom", fields: [fromId], references: [id])
  toId        String?
  to          Company? @relation("TxTo", fields: [toId], references: [id])
  type        String
  status      String
}

// --- MODULES ---

model Project {
  id          String   @id @default(cuid())
  title       String
  status      String
  phase       String?
  budget      Float    @default(0)
  description String?
  notes       String?
  driveLink   String?
  dueDate     DateTime?
  entity      String?
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
  clientName  String?
  clientId    String?
  client      Client?  @relation(fields: [clientId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tasks       Task[]
  timeLogs    TimeLog[]
  invoices    Invoice[]
  wikiPages   WikiPage[]
  files       File[]
  users       User[]
}

model File {
  id                    String   @id @default(cuid())
  name                  String
  path                  String   @map("chemin_reel")
  size                  Int
  mimeType              String
  isPublic              Boolean @default(false) @map("is_public")
  ownerId               String   @map("owner_id")
  owner                 User     @relation("FileOwner", fields: [ownerId], references: [id])
  companyId             String?
  company               Company? @relation(fields: [companyId], references: [id])
  projectId             String?
  project               Project? @relation(fields: [projectId], references: [id])
  socialPostId          String?
  socialPost            SocialPost? @relation(fields: [socialPostId], references: [id])
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Event {
  id          String   @id @default(cuid())
  title       String
  start       DateTime
  end         DateTime?
  allDay      Boolean  @default(false)
  isShared    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Client {
  id        String    @id @default(cuid())
  name      String
  email     String?
  type      String?
  entity    String?
  companyId String?
  company   Company?  @relation(fields: [companyId], references: [id])
  invoices  Invoice[]
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Invoice {
  id        String   @id @default(cuid())
  number    String   @unique
  status    String
  totalHT   Float
  dueDate   DateTime?
  clientId  String?
  client    Client?  @relation(fields: [clientId], references: [id])
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id])
  entity    String?
  companyId String?
  company   Company? @relation(fields: [companyId], references: [id])
  items     InvoiceItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model InvoiceItem {
  id          String  @id @default(cuid())
  description String
  quantity    Float
  price       Float
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
}

model Task {
  id        String   @id @default(cuid())
  title     String
  done      Boolean  @default(false)
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TimeLog {
  id        String   @id @default(cuid())
  duration  Float
  date      DateTime
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model InventoryItem {
  id          String    @id @default(cuid())
  name        String
  category    String
  status      String
  entity      String?
  borrowerId  String?
  borrower    User?     @relation(fields: [borrowerId], references: [id])
  returnDate  DateTime?
  reservations Reservation[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Service {
  id        String   @id @default(cuid())
  name      String
  price     Float
  category  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WikiPage {
  id        String   @id @default(cuid())
  title     String
  content   String?
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// --- COBALT MEDIA ---

model MediaScript {
  id          String   @id @default(cuid())
  title       String
  content     String?
  status      String
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SocialPost {
  id          String   @id @default(cuid())
  content     String?
  platform    String
  status      String
  scheduledFor DateTime?
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  files       File[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Reservation {
  id          String   @id @default(cuid())
  startDate   DateTime
  endDate     DateTime
  status      String
  itemId      String
  item        InventoryItem @relation(fields: [itemId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
EOF

# --- LIB ---

cat << 'EOF' > app/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
EOF

cat << 'EOF' > app/lib/dal.ts
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
EOF

# --- ACTIONS (BACKEND) ---

cat << 'EOF' > app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Identifiants incorrects" };
  }

  const expires = new Date(Date.now() + SESSION_DURATION);
  const cookieStore = await cookies();
  cookieStore.set("cobalt_session", user.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", expires, sameSite: "lax", path: "/" });
  
  const defaultEntity = user.allowedEntities?.split(',')[0] || "GLOBAL";
  cookieStore.set("cobalt_entity", defaultEntity);
  redirect("/");
}

export async function updatePasswordAction(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const user = await getCurrentUser();
  
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
     return { error: "Mot de passe actuel incorrect" };
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
  revalidatePath("/profile");
  redirect("/");
}

export async function createFirstAdmin(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const hashedPassword = await bcrypt.hash("cobalt123", 10);
  await prisma.user.create({
    data: { name, email, password: hashedPassword, role: "PRESIDENT", job: "Fondateur", title: "Fondateur", allowedEntities: "ARCHI,ATELIER,GLOBAL" }
  });
  redirect("/login");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("cobalt_session");
  cookieStore.delete("cobalt_entity");
  redirect("/login");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("cobalt_session")?.value;
  if (!userId) return null;
  return await prisma.user.findUnique({ where: { id: userId } });
}

export async function getActiveEntity() {
  const cookieStore = await cookies();
  const user = await getCurrentUser();
  if (!user) return "GLOBAL";
  const requestedEntity = cookieStore.get("cobalt_entity")?.value || "GLOBAL";
  const allowedEntities = user.allowedEntities?.split(',') || [];
  const hasAccess = allowedEntities.includes(requestedEntity) || ['GLOBAL', 'MEDIA'].includes(requestedEntity) || allowedEntities.includes('ALL');
  return hasAccess ? requestedEntity : "GLOBAL";
}

export async function switchEntityAction(entity: string) {
  const cookieStore = await cookies();
  const user = await getCurrentUser();
  if (!user) return;
  const allowedEntities = user.allowedEntities?.split(',') || [];
  if (allowedEntities.includes(entity) || ['GLOBAL', 'MEDIA'].includes(entity) || allowedEntities.includes('ALL')) {
    cookieStore.set("cobalt_entity", entity);
  }
  redirect("/"); 
}
EOF

cat << 'EOF' > app/actions/crm.ts
"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const type = formData.get("type") as string;
  const entities = formData.getAll("entities") as string[]; 
  const entityString = entities.join(","); 
  if (!name) return;
  await prisma.client.create({ data: { name, email: email || "", type, entity: entityString || "GLOBAL" } });
  revalidatePath("/crm");
}

export async function deleteClient(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId }, include: { invoices: true } });
  if (client && client.invoices.length > 0) return { error: "Impossible de supprimer un client facturé." };
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/crm");
}
EOF

cat << 'EOF' > app/actions/finance.ts
"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActiveEntity } from "@/app/actions/auth";

export async function createQuickInvoice(formData: FormData) {
  const firstClient = await prisma.client.findFirst();
  if (!firstClient) return;
  const entity = await getActiveEntity();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  await prisma.invoice.create({
    data: { entity: entity || "GLOBAL", number: `FAC-${Date.now().toString().slice(-6)}`, status: "DRAFT", totalHT: 0, clientId: firstClient.id, dueDate: dueDate }
  });
  revalidatePath("/finance");
}
EOF

cat << 'EOF' > app/actions/project.ts
"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActiveEntity } from "@/app/actions/auth";

export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  const entity = formData.get("entity") as string;
  const clientName = formData.get("clientName") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const activeEntity = await getActiveEntity();
  if (!title) return;
  await prisma.project.create({
    data: { title, status: "TODO", entity: entity || activeEntity || "GLOBAL", clientName: clientName || "", dueDate: dueDateStr ? new Date(dueDateStr) : null }
  });
  revalidatePath("/projects");
}

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const userId = formData.get("userId") as string;
  if (!title || !projectId) return;
  await prisma.task.create({ data: { title, projectId, userId: userId || undefined, done: false } });
  revalidatePath(`/projects/${projectId}`);
}

export async function toggleTask(taskId: string, currentStatus: boolean, projectId: string) {
  await prisma.task.update({ where: { id: taskId }, data: { done: !currentStatus } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string) {
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectStatus(projectId: string, status: string, phase: string) {
  await prisma.project.update({ where: { id: projectId }, data: { status, phase } });
  revalidatePath(`/projects/${projectId}`);
}
EOF

cat << 'EOF' > app/actions/system.ts
"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') throw new Error("Action interdite en production");
  await prisma.timeLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.file.deleteMany();
  await prisma.wikiPage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  revalidatePath("/");
}
EOF

cat << 'EOF' > app/actions/inventory.ts
"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createItem(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  if (!name) return;
  await prisma.inventoryItem.create({ data: { name, category, status: "AVAILABLE" } });
  revalidatePath("/inventory");
}

export async function deleteItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/inventory");
}

export async function borrowItem(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const borrowerName = formData.get("borrowerName") as string;
  const user = await prisma.user.findFirst({ where: { name: borrowerName } });
  if (!user) return;
  await prisma.inventoryItem.update({ where: { id: itemId }, data: { status: "BORROWED", borrowerId: user.id, returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  revalidatePath("/inventory");
}

export async function returnItem(id: string) {
  await prisma.inventoryItem.update({ where: { id }, data: { status: "AVAILABLE", borrowerId: null, returnDate: null } });
  revalidatePath("/inventory");
}
EOF

cat << 'EOF' > app/actions/hr.ts
"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import bcrypt from "bcryptjs";

const getRank = (user: any) => {
  if (!user) return 99;
  const cleanEmail = user.email?.trim().toLowerCase() || "";
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && cleanEmail === adminEmail) return 1;
  const role = user.role;
  if (role === 'PRESIDENT') return 1;
  if (role === 'DG') return 2;
  if (role === 'ASSOCIE') return 3;
  if (role === 'SALARIE') return 4;
  if (role === 'STAGIAIRE') return 5;
  return 99; 
};

export async function createUser(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;
  const myRank = getRank(currentUser);
  if (myRank > 2) return; 
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const job = formData.get("job") as string;
  const title = formData.get("title") as string;
  const entities = formData.getAll("entities").map(e => e.toString());
  const allowedEntities = entities.length > 0 ? entities.join(",") : "ARCHI,ATELIER,STUDIO";
  if (!name || !email) return;
  const hashedPassword = await bcrypt.hash("cobalt123", 10);
  await prisma.user.create({
    data: { name, email, role, job: job || "Membre", title: title || "", allowedEntities, password: hashedPassword, avatar: "" }
  });
  revalidatePath("/hr");
}

export async function updateUser(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;
  const id = formData.get("id") as string;
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) return;
  const myRank = getRank(currentUser);
  const targetRank = getRank(targetUser);
  let isAllowed = false;
  if (myRank === 1) isAllowed = true; 
  else if (myRank === 2) { if (currentUser.id === targetUser.id || targetRank > 2) isAllowed = true; }
  if (!isAllowed) return;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const job = formData.get("job") as string;
  const title = formData.get("title") as string;
  const entities = formData.getAll("entities").map(e => e.toString());
  const allowedEntities = entities.join(",");
  await prisma.user.update({ where: { id }, data: { name, email, role, job, title, allowedEntities } });
  revalidatePath("/hr");
  redirect("/hr");
}

export async function deleteUser(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return;
  const myRank = getRank(currentUser);
  const targetRank = getRank(targetUser);
  let isAllowed = false;
  if (myRank === 1) isAllowed = true;
  else if (myRank === 2 && targetRank > 2) isAllowed = true;
  if (!isAllowed) return;
  const count = await prisma.user.count();
  if (count <= 1) return;
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/hr");
}
EOF

cat << 'EOF' > app/actions/timesheet.ts
"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

function parseDuration(input: string): number {
  if (!input) return 0;
  const clean = input.toString().toLowerCase().trim().replace(',', '.');
  if (clean.includes('h') || clean.includes(':')) {
    const separator = clean.includes('h') ? 'h' : ':';
    const parts = clean.split(separator);
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    return hours + (minutes / 60);
  }
  return parseFloat(clean) || 0;
}

export async function logTime(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const userId = formData.get("userId") as string;
  const dateStr = formData.get("date") as string;
  const duration = parseDuration(formData.get("duration") as string);
  if (!projectId || !userId || !dateStr) return;
  const date = new Date(dateStr);
  const existingLog = await prisma.timeLog.findFirst({ where: { projectId, userId, date: date } });
  if (existingLog) {
    if (duration > 0) await prisma.timeLog.update({ where: { id: existingLog.id }, data: { duration } });
    else await prisma.timeLog.delete({ where: { id: existingLog.id } });
  } else if (duration > 0) {
    await prisma.timeLog.create({ data: { projectId, userId, date, duration } });
  }
  revalidatePath("/timesheet");
}
EOF

cat << 'EOF' > app/actions/media.ts
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
EOF

cat << 'EOF' > app/actions/files.ts
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
EOF

# --- COMPONENTS ---

cat << 'EOF' > components/ui/Card.tsx
export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-[#141416] p-6 rounded-xl border border-white/10 ${className}`}>{children}</div>;
}
EOF

cat << 'EOF' > components/ui/Badge.tsx
export function Badge({ children, color }: { children: React.ReactNode, color?: string }) {
  return <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300 border border-white/5">{children}</span>;
}
EOF

cat << 'EOF' > components/ui/Modal.tsx
export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141416] border border-white/10 rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > components/Sidebar.tsx
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Briefcase, DollarSign, Package, BookOpen, ChevronsUpDown, Clock, Users, LogOut, Settings, Calendar, PenTool, Image, BarChart, Send } from 'lucide-react';
import { useState } from 'react';
import { switchEntityAction, logoutAction } from '@/app/actions/auth'; 

const ENTITIES = {
  GLOBAL: { label: 'Collectif Cobalt', color: 'bg-gray-100 text-black', border: 'border-gray-500' },
  ARCHI: { label: 'Micro Gambi', color: 'bg-blue-600 text-white', border: 'border-blue-600' },
  ATELIER: { label: "Micro Lola", color: 'bg-orange-500 text-white', border: 'border-orange-500' },
  STUDIO: { label: 'Micro Lou-Ann', color: 'bg-emerald-600 text-white', border: 'border-emerald-600' },
  MEDIA: { label: 'Cobalt Média (Collectif)', color: 'bg-purple-600 text-white', border: 'border-purple-600' },
};

export default function Sidebar({ currentEntity, currentUser }: { currentEntity: string, currentUser: any }) {
  const pathname = usePathname();
  if (pathname === '/login') return null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const entityStyle = ENTITIES[currentEntity as keyof typeof ENTITIES] || ENTITIES.GLOBAL;
  const allowedList = currentUser?.allowedEntities?.split(',') || [];
  const isSuperUser = allowedList.includes('ALL');

  let menuItems = [];
  if (currentEntity === 'MEDIA') {
    menuItems = [
      { icon: Calendar, label: 'Calendrier', href: '/media/calendar' },
      { icon: PenTool, label: 'Studio & Scripts', href: '/media/studio' },
      { icon: Image, label: 'Assets & Brand', href: '/media/assets' },
      { icon: BarChart, label: 'Analytics', href: '/media/analytics' },
      { icon: Send, label: 'Publication', href: '/media/publish' },
      { icon: Package, label: 'Matériel Média', href: '/inventory' },
    ];
  } else if (currentEntity === 'GLOBAL') {
    menuItems = [
      { icon: LayoutDashboard, label: 'Vue Consolidée', href: '/' },
      { icon: Users, label: 'Équipe RH', href: '/hr' },
      { icon: BookOpen, label: 'Savoir (Wiki)', href: '/wiki' },
      { icon: Package, label: 'Inventaire Global', href: '/inventory' },
    ];
  } else {
    menuItems = [
      { icon: LayoutDashboard, label: 'Mon Dashboard', href: '/' },
      { icon: FolderKanban, label: 'Mes Projets', href: '/projects' },
      { icon: Briefcase, label: 'Mes Clients', href: '/crm' },
      { icon: DollarSign, label: 'Ma Finance', href: '/finance' },
      { icon: Clock, label: 'Feuille de Temps', href: '/timesheet' },
    ];
  }

  return (
    <div className="w-64 h-full bg-[#0A0A0C] border-r border-white/5 flex flex-col flex-shrink-0 transition-all duration-300">
      <div className="p-4">
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-full p-3 rounded-xl flex items-center justify-between transition-all border ${entityStyle.border} bg-white/5 hover:bg-white/10 group`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-8 h-8 rounded-lg ${entityStyle.color} flex-shrink-0 flex items-center justify-center font-bold shadow-lg`}>{entityStyle.label[0]}</div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">Espace actif</p>
                <p className="text-sm font-bold text-white truncate">{entityStyle.label}</p>
              </div>
            </div>
            <ChevronsUpDown size={16} className="text-gray-500 group-hover:text-white" />
          </button>
          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#141416] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/5">Mes Espaces</div>
              {Object.entries(ENTITIES).map(([key, data]) => {
                const isCommon = key === 'MEDIA' || key === 'GLOBAL';
                if (!isSuperUser && !allowedList.includes(key) && !isCommon) return null;
                return (
                  <button key={key} onClick={async () => { await switchEntityAction(key); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                    <div className={`w-2 h-2 rounded-full ${data.color}`} />{data.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-4">Menu Principal</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${isActive ? `bg-white/10 text-white border border-white/5` : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between px-2">
           <Link href="/profile" className="flex items-center gap-3 flex-1 overflow-hidden group hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white">{currentUser ? currentUser.name.charAt(0) : '?'}</div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{currentUser ? currentUser.name : 'Déconnecté'}</p>
                <p className="text-[10px] text-gray-500 truncate flex items-center gap-1"><Settings size={10} /> Mon Profil</p>
              </div>
           </Link>
           <button onClick={() => logoutAction()} title="Se déconnecter" className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors"><LogOut size={16} /></button>
        </div>
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > components/widgets/StatWidget.tsx
import { LucideIcon } from "lucide-react";
interface StatWidgetProps { title: string; value: string | number; icon: LucideIcon; trend?: string; color?: string; }
export function StatWidget({ title, value, icon: Icon, trend, color = "text-white" }: StatWidgetProps) {
  return (
    <div className="bg-[#141416] p-6 rounded-2xl border border-white/5 flex items-start justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-white">{value}</h3>
        {trend && <p className="text-xs text-emerald-500 font-bold mt-1">{trend}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-white/5 ${color}`}><Icon size={24} /></div>
    </div>
  );
}
EOF

# --- PAGES ---

cat << 'EOF' > app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, getActiveEntity } from "@/app/actions/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cobalt OS",
  description: "ERP for Collectif Cobalt",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const user = await getCurrentUser();
  const entity = await getActiveEntity();

  return (
    <html lang="fr">
      <body className={`${inter.className} bg-black text-white flex h-screen overflow-hidden`}>
        {user && <Sidebar currentEntity={entity} currentUser={user} />}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
EOF

cat << 'EOF' > app/login/page.tsx
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <form action={loginAction} className="bg-[#141416] p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Cobalt OS</h1>
        <input name="email" type="email" placeholder="Email" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" />
        <input name="password" type="password" placeholder="Mot de passe" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">Se connecter</button>
      </form>
    </div>
  );
}
EOF

cat << 'EOF' > app/page.tsx
import { prisma } from "@/app/lib/prisma";
import { getActiveEntity, getCurrentUser } from "@/app/actions/auth";
import Link from "next/link";
import { ArrowUpRight, Users, Clock, CreditCard, TrendingUp, Activity, AlertCircle } from "lucide-react";

export default async function Dashboard() {
  const entity = await getActiveEntity();
  const user = await getCurrentUser();
  const firstName = user ? user.name.split(' ')[0] : "l'Équipe"; 
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);

  const [projects, invoicesThisMonth, pendingInvoices, todaysLogs, activeUsers] = await Promise.all([
    prisma.project.findMany({ where: { entity: entity === 'GLOBAL' ? {} : entity, status: 'IN_PROGRESS' }, take: 4, orderBy: { updatedAt: 'desc' } }),
    prisma.invoice.findMany({ where: { entity: entity === 'GLOBAL' ? {} : entity, createdAt: { gte: firstDayOfMonth } } }),
    prisma.invoice.findMany({ where: { entity: entity === 'GLOBAL' ? {} : entity, status: 'PENDING' }, include: { client: true }, take: 3 }),
    prisma.timeLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } }, include: { user: true } }),
    prisma.user.count()
  ]);

  const currentRevenue = invoicesThisMonth.reduce((acc, inv) => acc + inv.totalHT, 0);
  const pendingRevenue = pendingInvoices.reduce((acc, inv) => acc + inv.totalHT, 0);
  const activeUserIds = new Set(todaysLogs.map(log => log.userId));

  return (
    <div className="space-y-8 fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{firstName}</span> 👋</h1>
          <p className="text-gray-400">Voici ce qui se passe aujourd'hui chez {entity === 'GLOBAL' ? 'Collectif Cobalt' : entity}.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={40} className="text-green-500" /></div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Production (Ce mois)</p>
           <h3 className="text-2xl font-black text-white">{currentRevenue.toLocaleString()} €</h3>
        </div>
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CreditCard size={40} className="text-orange-500" /></div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">En attente paiement</p>
           <h3 className="text-2xl font-black text-white">{pendingRevenue.toLocaleString()} €</h3>
        </div>
        <div className="p-5 bg-[#141416] border border-white/10 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={40} className="text-blue-500" /></div>
           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Actifs Aujourd'hui</p>
           <h3 className="text-2xl font-black text-white">{activeUserIds.size} <span className="text-sm text-gray-500 font-medium">/ {activeUsers}</span></h3>
        </div>
        <div className="p-5 bg-gradient-to-br from-indigo-900/50 to-[#141416] border border-indigo-500/20 rounded-2xl relative overflow-hidden">
           <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider mb-1">Projets en cours</p>
           <h3 className="text-2xl font-black text-white">{projects.length}</h3>
           <Link href="/projects" className="absolute bottom-5 right-5 text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">Voir tout</Link>
        </div>
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > app/projects/ProjectList.tsx
"use client";
import { useState } from 'react';
import { Plus, Search, Calendar, Briefcase, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import Link from 'next/link';
import { createProject } from '@/app/actions/project';
import { Project } from "@prisma/client";

type ProjectUI = Omit<Project, 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  color?: string;
  phase?: string;
}

export default function ProjectList({ initialProjects, currentEntity }: { initialProjects: ProjectUI[], currentEntity: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ENTITY_COLORS: Record<string, string> = { MEDIA: 'bg-purple-600', ATELIER: 'bg-orange-500', STUDIO: 'bg-emerald-600', ARCHI: 'bg-blue-600' };
  const getColor = (p: ProjectUI) => p.color || ENTITY_COLORS[p.entity] || 'bg-blue-500';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Projet">
        <form action={async (formData) => { await createProject(formData); setIsModalOpen(false); }} className="space-y-4">
           <div><label className="block text-xs font-bold text-gray-500 mb-1">Nom du Projet</label><input name="title" required placeholder="ex: Rénovation Villa M." className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" /></div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Entité</label>
                {currentEntity !== 'GLOBAL' ? (
                    <div className="w-full bg-[#141416] border border-white/10 rounded-lg p-3 text-gray-400 cursor-not-allowed"><input type="hidden" name="entity" value={currentEntity} />{currentEntity} (Verrouillé)</div>
                ) : (
                    <select name="entity" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors">
                        <option value="ARCHI">Micro Gambi</option><option value="ATELIER">Micro Lola</option><option value="STUDIO">Micro Lou-Ann</option><option value="MEDIA">Cobalt Média</option>
                    </select>
                )}
             </div>
             <div><label className="block text-xs font-bold text-gray-500 mb-1">Client</label><input name="clientName" required placeholder="ex: M. Martin" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" /></div>
           </div>
           <div><label className="block text-xs font-bold text-gray-500 mb-1">Date de livraison</label><input name="dueDate" type="date" className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" /></div>
           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Enregistrer</button>
        </form>
      </Modal>
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div><h1 className="text-3xl font-bold text-white">Projets</h1><p className="text-gray-500 mt-1">Gestion des chantiers ({initialProjects.length})</p></div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative group flex-1 md:w-64"><Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-white transition-colors" size={18} /><input type="text" placeholder="Rechercher..." className="w-full bg-[#141416] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white outline-none focus:border-blue-500 transition-all"/></div>
           <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"><Plus size={18} /><span className="hidden md:inline">Nouveau</span></button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialProjects.length === 0 ? <div className="col-span-3 text-center py-20 text-gray-500">Aucun projet trouvé. Créez-en un !</div> : initialProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block h-full">
                <Card className="group cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 relative overflow-hidden h-full">
                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white ${getColor(project)} rounded-bl-xl shadow-lg`}>{project.entity}</div>
                <div className="flex justify-between items-start mb-4"><Badge color="slate">{project.phase || "ESQ"}</Badge><div className="text-gray-600 hover:text-white transition-colors"><MoreHorizontal size={20} /></div></div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6"><Briefcase size={14} />{project.clientName}</div>
                <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-xs text-gray-400"><span>Progression</span><span>{project.progress || 0}%</span></div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden"><div className={`h-full ${getColor(project)}`} style={{ width: `${project.progress || 0}%` }}></div></div>
                </div>
                {project.dueDate && <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-600"><Calendar size={14} /> Livraison : {new Date(project.dueDate).toLocaleDateString()}</div>}
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > app/projects/page.tsx
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
EOF

cat << 'EOF' > app/projects/[id]/page.tsx
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { addTask, toggleTask, deleteTask } from "@/app/actions/project";
import { ArrowLeft, CheckCircle2, Circle, Clock, CreditCard, FileText, Plus, Trash2 } from "lucide-react";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, include: { tasks: { orderBy: { createdAt: 'desc' }, include: { user: true } }, invoices: true, timeLogs: true, wikiPages: true } });
  if (!project) notFound();
  const totalInvoiced = project.invoices.reduce((acc, inv) => acc + inv.totalHT, 0);
  const totalHours = project.timeLogs.reduce((acc, log) => acc + log.duration, 0);
  const progressPercent = project.budget > 0 ? (totalInvoiced / project.budget) * 100 : 0;
  const formatHours = (val: number) => { let h = Math.floor(val); let m = Math.round((val - h) * 60); if (m === 60) { h++; m = 0; } return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`; };
  const users = await prisma.user.findMany();

  return (
    <div className="space-y-8 fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div><Link href="/projects" className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 mb-2 transition-colors"><ArrowLeft size={12}/> Retour aux projets</Link><h1 className="text-4xl font-black text-white tracking-tighter mb-1">{project.title}</h1><div className="flex items-center gap-3 text-sm text-gray-400"><span className="bg-white/10 px-2 py-0.5 rounded text-xs font-bold text-white border border-white/5 uppercase">{project.entity}</span><span>{project.clientName}</span><span>•</span><span>Phase : {project.phase || "Non définie"}</span></div></div>
        <div className="flex gap-4"><div className="text-right"><p className="text-[10px] uppercase font-bold text-gray-500">Budget</p><p className="text-xl font-bold text-white">{project.budget.toLocaleString()} €</p></div><div className="text-right"><p className="text-[10px] uppercase font-bold text-gray-500">Facturé</p><p className={`text-xl font-bold ${totalInvoiced > project.budget ? 'text-green-500' : 'text-blue-400'}`}>{totalInvoiced.toLocaleString()} €</p></div></div>
      </div>
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-green-400" style={{ width: `${Math.min(progressPercent, 100)}%` }}/></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141416] p-4 rounded-xl border border-white/10">
            <form action={addTask} className="flex gap-2"><input type="hidden" name="projectId" value={project.id} /><div className="flex-1 relative"><input name="title" placeholder="Ajouter une tâche à faire..." required className="w-full bg-transparent text-white placeholder:text-gray-600 outline-none h-full pl-2" /></div><select name="userId" className="bg-black/40 text-xs text-gray-400 border border-white/10 rounded px-2 outline-none"><option value="">Non assigné</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select><button type="submit" className="bg-white text-black p-2 rounded-lg hover:bg-gray-200"><Plus size={16}/></button></form>
          </div>
          <div className="space-y-2">
             {project.tasks.map(task => (
               <div key={task.id} className="group flex items-center gap-3 p-3 bg-[#141416] border border-white/5 hover:border-white/20 rounded-xl transition-all">
                  <form action={toggleTask.bind(null, task.id, task.done, project.id)}><button className={`mt-1 transition-colors ${task.done ? 'text-green-500' : 'text-gray-600 hover:text-white'}`}>{task.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button></form>
                  <div className={`flex-1 ${task.done ? 'opacity-40 line-through' : ''}`}><p className="text-sm font-medium text-white">{task.title}</p>{task.user && (<div className="flex items-center gap-1 mt-1"><div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">{task.user.name.charAt(0)}</div><span className="text-[10px] text-gray-500">{task.user.name}</span></div>)}</div>
                  <form action={deleteTask.bind(null, task.id, project.id)}><button className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"><Trash2 size={14}/></button></form>
               </div>
             ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#141416] p-5 rounded-2xl border border-white/5"><div className="flex items-center gap-2 mb-4 text-pink-500"><Clock size={18}/> <h3 className="font-bold text-white">Temps passé</h3></div><p className="text-3xl font-black text-white mb-1">{formatHours(totalHours)}</p><p className="text-xs text-gray-500">Soit environ <span className="text-white font-bold">{Math.round(totalHours / 8)} jours</span> de travail.</p><div className="mt-4 pt-4 border-t border-white/5"><Link href="/timesheet" className="text-xs font-bold text-gray-400 hover:text-white flex items-center justify-between">Saisir des heures <ArrowLeft className="rotate-180" size={12}/></Link></div></div>
          <div className="bg-[#141416] p-5 rounded-2xl border border-white/5"><div className="flex items-center gap-2 mb-4 text-green-500"><CreditCard size={18}/> <h3 className="font-bold text-white">Facturation</h3></div><div className="space-y-2">{project.invoices.map(inv => (<Link key={inv.id} href={`/invoices/${inv.id}`} className="flex justify-between items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-xs"><span className="text-gray-300 font-mono">{inv.number}</span><span className="font-bold text-white">{inv.totalHT.toLocaleString()} €</span></Link>))}</div><div className="mt-4 pt-4 border-t border-white/5"><Link href="/invoices/new" className="text-xs font-bold text-gray-400 hover:text-white flex items-center justify-between">Créer une facture <Plus size={12}/></Link></div></div>
          <div className="bg-[#141416] p-5 rounded-2xl border border-white/5"><div className="flex items-center gap-2 mb-4 text-yellow-500"><FileText size={18}/> <h3 className="font-bold text-white">Documents</h3></div><div className="space-y-2">{project.wikiPages.map(page => (<Link key={page.id} href={`/wiki?pageId=${page.id}`} className="block text-sm text-gray-300 hover:text-white hover:underline truncate">📄 {page.title}</Link>))}</div></div>
        </div>
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > app/media/page.tsx
import { redirect } from "next/navigation";
export default function MediaPage() { redirect("/media/calendar"); }
EOF

cat << 'EOF' > app/media/calendar/page.tsx
import { prisma } from "@/app/lib/prisma";
import { createSocialPost } from "@/app/actions/media";
import { Calendar as CalendarIcon, Plus, Youtube, Linkedin, Instagram, Send } from "lucide-react";

export default async function MediaCalendarPage() {
  const posts = await prisma.socialPost.findMany({ orderBy: { scheduledFor: 'asc' }, include: { author: true } });
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YOUTUBE': return <Youtube size={16} className="text-red-500" />;
      case 'LINKEDIN': return <Linkedin size={16} className="text-blue-500" />;
      case 'INSTAGRAM': return <Instagram size={16} className="text-pink-500" />;
      default: return <Send size={16} className="text-gray-500" />;
    }
  };
  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div><h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3"><CalendarIcon className="text-purple-500" /> Calendrier Éditorial</h1><p className="text-gray-400">Planification des contenus réseaux sociaux.</p></div>
        <div className="bg-[#141416] p-2 rounded-xl border border-white/10 w-full md:w-auto">
          <form action={createSocialPost} className="flex flex-col md:flex-row gap-2">
            <select name="platform" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"><option value="YOUTUBE">YouTube</option><option value="INSTAGRAM">Instagram</option><option value="LINKEDIN">LinkedIn</option></select>
            <input name="content" placeholder="Sujet du post..." required className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none w-full md:w-64" />
            <input name="scheduledFor" type="date" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none" />
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-500 transition-colors flex items-center justify-center gap-2"><Plus size={18} /> <span className="md:hidden">Ajouter</span></button>
          </form>
        </div>
      </div>
      <div className="grid gap-4">
        {posts.length === 0 && <div className="text-center py-20 text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">Aucun post programmé. Lancez la machine ! 🚀</div>}
        {posts.map((post) => (
          <div key={post.id} className="bg-[#141416] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-white/20 transition-all group">
            <div className="flex-shrink-0 w-16 text-center bg-white/5 rounded-lg p-2 border border-white/5"><span className="block text-xs text-gray-500 uppercase font-bold">{post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString('fr-FR', { month: 'short' }) : 'DRAFT'}</span><span className="block text-xl font-black text-white">{post.scheduledFor ? new Date(post.scheduledFor).getDate() : '?'}</span></div>
            <div className="flex-1"><div className="flex items-center gap-2 mb-1">{getPlatformIcon(post.platform)}<span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{post.platform}</span><span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${post.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-500' : post.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-700 text-gray-400'}`}>{post.status}</span></div><h3 className="text-white font-medium">{post.content}</h3></div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-black/20 px-3 py-1.5 rounded-full border border-white/5"><div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-bold text-white">{post.author.name.charAt(0)}</div>{post.author.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > app/media/studio/page.tsx
import { prisma } from "@/app/lib/prisma";
import { saveScript } from "@/app/actions/media";
import { PenTool, Plus, FileText, MoreHorizontal } from "lucide-react";

export default async function MediaStudioPage() {
  const scripts = await prisma.mediaScript.findMany({ orderBy: { updatedAt: 'desc' }, include: { author: true } });
  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-end"><div><h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3"><PenTool className="text-pink-500" /> Studio & Scripts</h1><p className="text-gray-400">Idéation, brouillons et scripts vidéos.</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between group hover:border-purple-500/50 transition-all">
            <div><h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="text-purple-400" /> Nouvelle Idée</h3><form action={saveScript} className="space-y-3"><input name="title" placeholder="Titre du concept..." required className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"/><textarea name="content" placeholder="Détails, hook, notes..." rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500 resize-none"/><button type="submit" className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">Créer le brouillon</button></form></div>
        </div>
        {scripts.map((script) => (
            <div key={script.id} className="bg-[#141416] p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all flex flex-col h-full group relative cursor-pointer">
                <div className="flex justify-between items-start mb-4"><div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-white transition-colors"><FileText size={20} /></div><button className="text-gray-600 hover:text-white"><MoreHorizontal size={20} /></button></div>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{script.title}</h3><p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">{script.content || "Aucun contenu..."}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-white/5 px-2 py-1 rounded">{script.status}</span><div className="flex items-center gap-2 text-xs text-gray-500"><span>{new Date(script.updatedAt).toLocaleDateString()}</span><div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[8px] text-white font-bold">{script.author.name.charAt(0)}</div></div></div>
            </div>
        ))}
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > app/media/assets/page.tsx
import { prisma } from "@/app/lib/prisma";
import { uploadFile, deleteFile } from "@/app/actions/files";
import { Image, FileText, Trash2, Upload, Globe, Lock } from "lucide-react";

export default async function MediaAssetsPage() {
  const files = await prisma.file.findMany({ orderBy: { createdAt: 'desc' }, include: { owner: true } });
  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-end"><div><h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3"><Image className="text-pink-500" /> Assets & Brand</h1><p className="text-gray-400">Banque d'images, logos et fichiers partagés.</p></div></div>
      <div className="bg-[#141416] border border-dashed border-white/20 rounded-2xl p-8 text-center hover:bg-white/5 transition-colors">
        <form action={uploadFile} className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white/5 rounded-full text-gray-400"><Upload size={24} /></div>
            <div><p className="text-white font-bold">Déposez vos fichiers ici</p><p className="text-xs text-gray-500">PNG, JPG, PDF, SVG (Max 50MB)</p></div>
            <div className="flex items-center gap-4"><label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"><span>Parcourir</span><input type="file" name="file" className="hidden" required /></label><label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer"><input type="checkbox" name="isPublic" className="accent-blue-500" />Public ?</label></div><button type="submit" className="hidden">Upload</button>
        </form>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
            <div key={file.id} className="group relative bg-[#141416] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"><form action={deleteFile.bind(null, file.id)}><button className="p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-lg backdrop-blur-sm transition-colors"><Trash2 size={12} /></button></form></div>
                <div className="flex flex-col items-center gap-3 mb-2"><div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-gray-400">{file.mimeType.startsWith('image/') ? <Image size={24} /> : <FileText size={24} />}</div><div className="text-center w-full"><p className="text-sm font-bold text-white truncate w-full">{file.name}</p><p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div></div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5"><div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">{file.owner.name.charAt(0)}</div><span className="text-[10px] text-gray-500 truncate max-w-[60px]">{file.owner.name}</span></div>{file.isPublic ? <Globe size={12} className="text-blue-400"/> : <Lock size={12} className="text-gray-600"/>}</div>
            </div>
        ))}
        {files.length === 0 && <div className="col-span-full text-center py-10 text-gray-500 italic">Aucun fichier.</div>}
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > app/media/analytics/page.tsx
import { BarChart, TrendingUp, Users, Eye } from "lucide-react";
import { StatWidget } from "@/components/widgets/StatWidget";

export default function MediaAnalyticsPage() {
  return (
    <div className="space-y-8 fade-in">
       <div className="flex justify-between items-end"><div><h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3"><BarChart className="text-blue-500" /> Analytics</h1><p className="text-gray-400">Performances des contenus (YouTube, Instagram, LinkedIn).</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatWidget title="Vues Totales" value="124.5K" icon={Eye} trend="+12%" color="text-blue-500" />
        <StatWidget title="Abonnés" value="8,942" icon={Users} trend="+54" color="text-purple-500" />
        <StatWidget title="Engagement" value="4.8%" icon={TrendingUp} trend="-0.2%" color="text-green-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#141416] border border-white/5 rounded-2xl p-6 h-64 flex items-center justify-center text-gray-600 border-dashed">[Graphique Évolution Vues]</div>
        <div className="bg-[#141416] border border-white/5 rounded-2xl p-6 h-64 flex items-center justify-center text-gray-600 border-dashed">[Répartition par Plateforme]</div>
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > app/media/publish/page.tsx
import { Send } from "lucide-react";
export default function MediaPublishPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 fade-in">
        <Send size={48} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white">Workflow de Publication</h2>
        <p className="text-sm mt-2">Fonctionnalité à venir : Validation et publication multi-plateformes.</p>
    </div>
  );
}
EOF

echo "✅ PROJET RECONSTRUIT AVEC SUCCÈS ! N'oubliez pas de lancer 'npx prisma generate' si vous avez Node.js installé."
