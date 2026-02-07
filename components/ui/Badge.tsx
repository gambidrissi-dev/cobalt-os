export function Badge({ children, color }: { children: React.ReactNode, color?: string }) {
  return <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300 border border-white/5">{children}</span>;
}
