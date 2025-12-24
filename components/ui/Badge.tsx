type BadgeColor = 'slate' | 'blue' | 'green' | 'red' | 'orange' | 'purple';

const STYLES = {
  slate: 'bg-white/5 text-gray-400 border-white/5',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20', 
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export function Badge({ children, color = 'slate' }: { children: React.ReactNode, color?: BadgeColor }) {
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${STYLES[color]} uppercase tracking-widest`}>
      {children}
    </span>
  );
}