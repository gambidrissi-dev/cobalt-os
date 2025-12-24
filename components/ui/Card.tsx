export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-[#141416] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}