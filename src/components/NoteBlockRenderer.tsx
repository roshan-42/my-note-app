import type { Language } from '../types';

interface Props {
  content: string;
  language?: Language;
}

const isHtml = (c: string) => c.trim().startsWith('<');

export default function NoteBlockRenderer({ content, language = 'en' }: Props) {
  if (!content) {
    return <p className="text-gray-400 italic">No content available</p>;
  }

  if (isHtml(content)) {
    return (
      <div
        className={`prose prose-invert max-w-none
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-4
          [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-100 [&_h2]:mt-5 [&_h2]:mb-3
          [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-200 [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:my-4
          [&_strong]:font-bold [&_strong]:text-white
          [&_em]:italic [&_em]:text-gray-300
          [&_u]:underline
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4
          [&_li]:text-gray-300 [&_li]:my-1
          [&_code]:bg-slate-900 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-red-400 [&_code]:text-sm
          [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-4
          [&_blockquote]:border-l-4 [&_blockquote]:border-amber-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-4
          [&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300
          [&_table]:border-collapse [&_table]:w-full [&_table]:my-4
          [&_thead]:bg-slate-800
          [&_th]:border [&_th]:border-slate-600 [&_th]:px-3 [&_th]:py-2 [&_th]:text-white [&_th]:font-semibold [&_th]:text-left
          [&_td]:border [&_td]:border-slate-600 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-300
          [&_tbody_tr]:hover:bg-slate-800/50
          ${language === 'np' ? 'text-lg' : ''}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <p className={`text-gray-300 leading-relaxed whitespace-pre-wrap ${language === 'np' ? 'text-lg' : ''}`}>
      {content}
    </p>
  );
}
