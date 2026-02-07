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
