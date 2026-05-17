import { useMemo } from 'react';
import { renderMath } from '../utils/math';
import type { Language } from '../types';

interface Props {
  content: string;
  language?: Language;
}

const isHtml = (c: string) => c.trim().startsWith('<');

export default function NoteBlockRenderer({ content, language = 'en' }: Props) {
  const html = useMemo(() => isHtml(content) ? renderMath(content) : '', [content]);

  if (!content) {
    return <p className="text-[var(--text-3)] italic">No content available</p>;
  }

  if (isHtml(content)) {
    return (
      <div
        className={`prose prose-invert max-w-none
          [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[var(--text-1)] [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:font-display
          [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[var(--text-1)] [&_h2]:mt-5 [&_h2]:mb-3
          [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[var(--text-1)] [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:text-[var(--text-2)] [&_p]:leading-relaxed [&_p]:my-4
          [&_strong]:font-bold [&_strong]:text-[var(--text-1)]
          [&_em]:italic [&_em]:text-[var(--text-2)]
          [&_u]:underline
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4
          [&_li]:text-[var(--text-2)] [&_li]:my-1
          [&_code]:bg-[var(--bg-0)] [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[var(--accent)] [&_code]:text-sm
          [&_pre]:bg-[var(--bg-0)] [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-4
          [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--text-3)] [&_blockquote]:my-4
          [&_a]:text-[var(--accent)] [&_a]:underline [&_a]:hover:text-[var(--accent-hover)]
          [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_table]:block sm:[&_table]:table [&_table]:overflow-x-auto
          [&_thead]:bg-[var(--surface-2)]
          [&_th]:border [&_th]:border-[var(--border)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-[var(--text-1)] [&_th]:font-semibold [&_th]:text-left
          [&_td]:border [&_td]:border-[var(--border)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-[var(--text-2)]
          [&_tbody_tr]:hover:bg-[var(--surface-1)]
          ${language === 'np' ? 'text-lg' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Plain text — also support inline math
  return (
    <p
      className={`text-[var(--text-2)] leading-relaxed whitespace-pre-wrap ${language === 'np' ? 'text-lg' : ''}`}
      dangerouslySetInnerHTML={{ __html: renderMath(escapeHtml(content)) }}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
