import { prisma } from "@/app/lib/prisma";
import { uploadFile, deleteFile } from "@/app/actions/files";
import { Image, FileText, Trash2, Upload, Globe, Lock } from "lucide-react";

export default async function MediaAssetsPage() {
  const files = await prisma.file.findMany({ orderBy: { createdAt: 'desc' }, include: { owner: true } });
  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-end"><div><h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3"><Image className="text-pink-500" /> Assets & Brand</h1><p className="text-gray-400">Banque d'images, logos et fichiers partagés.</p></div></div>
      <div className="bg-[#141416] border border-dashed border-white/20 rounded-2xl p-8 text-center hover:bg-white/5 transition-colors">
        <form action={uploadFile} className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white/5 rounded-full text-gray-400"><Upload size={24} /></div>
            <div><p className="text-white font-bold">Déposez vos fichiers ici</p><p className="text-xs text-gray-500">PNG, JPG, PDF, SVG (Max 50MB)</p></div>
            <div className="flex items-center gap-4"><label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"><span>Parcourir</span><input type="file" name="file" className="hidden" required /></label><label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer"><input type="checkbox" name="isPublic" className="accent-blue-500" />Public ?</label></div><button type="submit" className="hidden">Upload</button>
        </form>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
            <div key={file.id} className="group relative bg-[#141416] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"><form action={deleteFile.bind(null, file.id)}><button className="p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-lg backdrop-blur-sm transition-colors"><Trash2 size={12} /></button></form></div>
                <div className="flex flex-col items-center gap-3 mb-2"><div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-gray-400">{file.mimeType.startsWith('image/') ? <Image size={24} /> : <FileText size={24} />}</div><div className="text-center w-full"><p className="text-sm font-bold text-white truncate w-full">{file.name}</p><p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div></div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5"><div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">{file.owner.name.charAt(0)}</div><span className="text-[10px] text-gray-500 truncate max-w-[60px]">{file.owner.name}</span></div>{file.isPublic ? <Globe size={12} className="text-blue-400"/> : <Lock size={12} className="text-gray-600"/>}</div>
            </div>
        ))}
        {files.length === 0 && <div className="col-span-full text-center py-10 text-gray-500 italic">Aucun fichier.</div>}
      </div>
    </div>
  );
}
