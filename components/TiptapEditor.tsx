"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (richText: string) => void;
  editable?: boolean;
}

export default function TiptapEditor({ content, onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    // CORRECTION ICI : On désactive le rendu immédiat pour éviter l'erreur SSR
    immediatelyRender: false, 
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({
        placeholder: 'Commencez à écrire votre document ici... (Tapez "/" pour les commandes)',
      }),
    ],
    content: content || '', 
    editable: editable,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] text-gray-300', // J'ai ajouté text-gray-300 pour la lisibilité
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* BARRE D'OUTILS (Visible seulement si éditable) */}
      {editable && (
        <div className="flex items-center gap-1 p-2 bg-[#1E1E21] border border-white/10 rounded-lg w-fit sticky top-0 z-10 shadow-xl">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-blue-400 bg-white/10' : 'text-gray-400'}`}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-blue-400 bg-white/10' : 'text-gray-400'}`}
          >
            <Italic size={16} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'text-blue-400 bg-white/10' : 'text-gray-400'}`}
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'text-blue-400 bg-white/10' : 'text-gray-400'}`}
          >
            <Heading2 size={16} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'text-blue-400 bg-white/10' : 'text-gray-400'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive('orderedList') ? 'text-blue-400 bg-white/10' : 'text-gray-400'}`}
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-white/10 ${editor.isActive('blockquote') ? 'text-blue-400 bg-white/10' : 'text-gray-400'}`}
          >
            <Quote size={16} />
          </button>
        </div>
      )}

      {/* ZONE DE TEXTE */}
      <div className="bg-[#141416] p-8 rounded-2xl border border-white/5 min-h-[500px] cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}