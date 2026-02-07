export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-[#141416] p-6 rounded-xl border border-white/10 ${className}`}>{children}</div>;
}
