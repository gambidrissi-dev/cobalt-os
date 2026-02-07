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
