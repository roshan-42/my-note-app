import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Undo2, Redo2, Code, Grid3x3 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

export default function RichTextEditor({ value, onChange, disabled = false, minHeight = 200 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editable: !disabled,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div style={{ minHeight }} className="bg-slate-700 border border-slate-600 rounded-lg animate-pulse" />;
  }

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded text-white transition-colors text-xs ${
      isActive ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'
    } disabled:opacity-50`;

  return (
    <div className="flex flex-col border border-slate-600 rounded-lg overflow-hidden bg-slate-700">
      <div className="bg-slate-800 border-b border-slate-600 p-2 flex flex-wrap gap-1">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={disabled} className={buttonClass(editor.isActive('bold'))} title="Bold"><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={disabled} className={buttonClass(editor.isActive('italic'))} title="Italic"><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={disabled} className={buttonClass(editor.isActive('underline'))} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
        <div className="w-px bg-slate-600" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled} className={buttonClass(editor.isActive('bulletList'))} title="Bullet"><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled} className={buttonClass(editor.isActive('orderedList'))} title="Numbered"><ListOrdered className="w-4 h-4" /></button>
        <div className="w-px bg-slate-600" />
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} disabled={disabled} className={buttonClass(editor.isActive('codeBlock'))} title="Code"><Code className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={disabled} className={buttonClass(editor.isActive('table'))} title="Table"><Grid3x3 className="w-4 h-4" /></button>
        <div className="w-px bg-slate-600" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={disabled} className={buttonClass(false)} title="Undo"><Undo2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={disabled} className={buttonClass(false)} title="Redo"><Redo2 className="w-4 h-4" /></button>
      </div>
      <div style={{ minHeight }} className="flex-1 overflow-auto bg-slate-700 px-4 py-3 text-base text-white">
        <EditorContent editor={editor} className="prose prose-invert max-w-none" />
      </div>
    </div>
  );
}
