# Architecture Cobalt OS

Ce projet suit une architecture modulaire inspirée des systèmes d'exploitation.

## 1. Core (`/app/core`)
Le noyau du système. Contient les éléments partagés et agnostiques du métier.
- **UI** : Composants graphiques de base (Boutons, Modales, Sidebar).
- **Utils** : Fonctions utilitaires (Formatage dates, devises).

## 2. Services (`/app/services`)
Les couches techniques transversales.
- **Auth** : Gestion des sessions, mots de passe, permissions.
- **Database** : Connexion Prisma (`db.ts`).
- **Storage** : Gestion des fichiers (Uploads).

## 3. Modules (`/app/modules`)
Les "Applications" métier. Chaque module doit être autonome.
- **CRM** : Clients, Prospects.
- **Finance** : Factures, Transactions.
- **HR** : Utilisateurs, Organigramme.
- **Projects** : Gestion de projet, Kanban.

## 4. Routes (`/app`)
La couche de présentation (Next.js App Router).
Les pages (`page.tsx`) ne doivent contenir que de l'affichage et appeler les Server Actions des modules.

---
*Règle d'or : Un module ne doit pas importer directement le code d'un autre module. Passez par des Services ou des événements.*