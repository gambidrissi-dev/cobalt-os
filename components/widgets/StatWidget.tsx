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
