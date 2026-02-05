import { FileText, Download } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: string;
}

export function FileWidget({ files, title = "Fichiers Récents" }: { files: FileItem[], title?: string }) {
  return (
    <div className="bg-[#141416] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-white text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-white/5">
        {files.map((file) => (
          <div key={file.id} className="px-6 py-3 flex items-center justify-between group hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-200 font-medium">{file.name}</p>
                <p className="text-[10px] text-gray-500">{file.size}</p>
              </div>
            </div>
            <button className="text-gray-600 hover:text-white transition-colors">
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}