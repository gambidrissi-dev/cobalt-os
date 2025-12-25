import { prisma } from "../lib/prisma";
import { getActiveEntity, getCurrentUser } from "../actions/auth"; // <--- 1. IMPORT AJOUTÉ
import { logTime } from "@/app/actions/timesheet";
import { Clock, Save } from "lucide-react";

// Fonction pour générer les dates de la semaine actuelle
function getCurrentWeek() {
  const curr = new Date(); // Aujourd'hui
  const week = [];
  
  // On se cale sur le Lundi (1) - Ajustement basique pour la semaine courante
  const first = curr.getDate() - curr.getDay() + 1;
  
  for (let i = 0; i < 5; i++) {
    // On crée une nouvelle date pour éviter les références partagées
    const day = new Date(curr); 
    day.setDate(first + i);
    week.push(day);
  }
  return week;
}

export default async function TimesheetPage() {
  const entity = await getActiveEntity();
  const weekDates = getCurrentWeek();
  
  // --- 2. MODIFICATION : On récupère le VRAI utilisateur connecté ---
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="p-10 text-center border border-white/10 rounded-xl">
        <p className="text-red-400 font-bold">Non connecté.</p>
        <p className="text-gray-500 text-sm">Veuillez vous connecter pour voir votre feuille de temps.</p>
      </div>
    );
  }

  // 1. Récupérer les projets ACTIFS de l'entité
  const projects = await prisma.project.findMany({
    where: { 
      entity: entity === 'GLOBAL' ? {} : entity,
      status: 'IN_PROGRESS' 
    }
  });

  // 2. Récupérer les logs existants pour cette semaine
  // On prend une marge large pour être sûr de tout attraper
  const startOfWeek = new Date(weekDates[0]); 
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(weekDates[4]);
  endOfWeek.setHours(23,59,59,999);

  const logs = await prisma.timeLog.findMany({
    where: {
      userId: user.id, // On filtre sur l'ID de l'utilisateur connecté
      date: {
        gte: startOfWeek,
        lte: endOfWeek
      }
    }
  });

  // Helper pour trouver la durée déjà saisie dans la grille
  const getDuration = (projectId: string, date: Date) => {
    const log = logs.find(l => 
      l.projectId === projectId && 
      new Date(l.date).toDateString() === date.toDateString()
    );
    return log ? log.duration : "";
  };

  // Calcul du total de la semaine
  const weeklyTotal = logs.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="space-y-8 fade-in">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Clock className="text-pink-500" /> Feuille de Temps
          </h1>
          <p className="text-gray-400">Semaine du {weekDates[0].toLocaleDateString()} au {weekDates[4].toLocaleDateString()}</p>
        </div>
        
        <div className="bg-[#141416] px-6 py-3 rounded-2xl border border-white/10 text-right">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Semaine</p>
          <p className="text-2xl font-black text-white">{weeklyTotal} h</p>
        </div>
      </div>

      {/* GRILLE DE SAISIE */}
      <div className="bg-[#141416] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
              <th className="p-4 w-1/3">Projet</th>
              {weekDates.map((date, i) => (
                <th key={i} className="p-4 text-center border-l border-white/5">
                  <span className="hidden md:inline">{date.toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
                  <span className="md:hidden">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                  <br />
                  <span className="text-white">{date.getDate()}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                
                {/* NOM DU PROJET */}
                <td className="p-4">
                  <div className="font-bold text-white text-sm">{project.title}</div>
                  <div className="text-[10px] text-gray-500">{project.clientName}</div>
                </td>

                {/* CASES DE SAISIE (LUNDI A VENDREDI) */}
                {weekDates.map((date, i) => (
                  <td key={i} className="p-0 border-l border-white/5 relative h-full">
                    <form action={logTime} className="w-full h-full absolute inset-0">
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="date" value={date.toDateString()} /> 
                      
                      <div className="w-full h-full relative group">
                        <input 
                          name="duration"
                          type="number" 
                          step="0.25" 
                          placeholder="-"
                          defaultValue={getDuration(project.id, date)}
                          className="w-full h-full bg-transparent text-center font-mono font-bold text-gray-300 focus:text-pink-500 outline-none hover:bg-white/5 focus:bg-white/10 transition-colors"
                        />
                        {/* Indicateur de sauvegarde au survol */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-50 pointer-events-none">
                            <Save size={8} className="text-pink-500"/>
                        </div>
                      </div>
                    </form>
                  </td>
                ))}
              </tr>
            ))}
            {projects.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-500 italic">
                        Aucun projet actif trouvé pour {entity}. Créez un projet pour saisir du temps.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        💡 Astuce : Tapez votre temps (ex: 1.5 pour 1h30) et appuyez sur <strong>Entrée</strong> pour sauvegarder.
      </p>
    </div>
  );
}