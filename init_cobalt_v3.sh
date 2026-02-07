#!/bin/bash

echo "🚀 INITIALISATION DE COBALT OS V3..."

# 1. CRÉATION DU PROJET NEXT.JS (Mode non-interactif)
# On force la structure app/ à la racine (--no-src-dir) pour correspondre à notre architecture
npx create-next-app@latest cobalt-os-v3 \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm \
  --yes

cd cobalt-os-v3

# 2. INSTALLATION DES DÉPENDANCES
echo "📦 Installation des modules..."
npm install @prisma/client @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react bcryptjs clsx tailwind-merge date-fns
npm install -D prisma @types/bcryptjs

# 3. INITIALISATION PRISMA
echo "🗄️ Configuration de la Base de Données..."
npx prisma init

# Configuration du .env (À adapter selon votre Docker)
cat << 'EOF' > .env
DATABASE_URL="postgresql://cobalt_user:cobalt_password_secure@localhost:5432/cobalt_os"
ADMIN_EMAIL="gambi@cobalt.com"
EOF

# 4. DÉPLOIEMENT DU CODE SOURCE
echo "🏗️ Construction de l'architecture..."

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

# --- SCHEMA PRISMA (COMPLET) ---

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
  inventoryItems InventoryItem[]
  mediaScripts   MediaScript[]
  socialPosts    SocialPost[]
  brandAssets    BrandAsset[]
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
  brandAssets           BrandAsset[]
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
  companyId   String?
  company     Company?  @relation(fields: [companyId], references: [id])
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
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
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
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
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

model BrandAsset {
  id          String   @id @default(cuid())
  name        String
  type        String   // LOGO, FONT, COLOR, TEMPLATE
  value       String?  // Hex code, etc.
  fileId      String?
  file        File?    @relation(fields: [fileId], references: [id])
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
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

# --- ACTIONS (AUTH FUSIONNÉE) ---

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

# --- ACTIONS (MEDIA) ---

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

# --- COMPONENTS (SIDEBAR DYNAMIQUE) ---

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

echo "✅ COBALT OS V3 EST PRÊT ! Lancez 'cd cobalt-os-v3' puis 'npm run dev' pour démarrer."