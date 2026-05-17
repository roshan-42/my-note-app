import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Language } from '../types';

interface Props {
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
  language: Language;
}

const isHtml = (c: string) => c.trim().startsWith('<');

export default function ExamQuestionCard({
  question_en, question_np, answer_en, answer_np, type, language
}: Props) {
  const [showAnswer, setShowAnswer] = useState(false);

  const question = language === 'en' ? question_en : question_np || question_en;
  const answer = language === 'en' ? answer_en : answer_np || answer_en;

  return (
    <div className="card-surface card-surface-hover rounded-xl px-5 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium text-[var(--text-2)] ${language === 'np' ? 'text-lg leading-relaxed' : ''}`}>
            {question}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            type === 'past'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'bg-[var(--surface-3)] text-[var(--text-2)]'
          }`}>
            {type === 'past' ? 'Past' : 'Possible'}
          </span>
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="p-1.5 rounded hover:bg-[var(--surface-2)] transition-colors text-[var(--text-3)] hover:text-[var(--accent)]"
            aria-label={showAnswer ? 'Hide answer' : 'Show answer'}
          >
            {showAnswer ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showAnswer && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          {isHtml(answer) ? (
            <div
              className={`prose prose-invert max-w-none prose-sm
                [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[var(--text-1)] [&_h1]:my-2
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[var(--text-1)] [&_h2]:my-2
                [&_h3]:font-semibold [&_h3]:text-[var(--text-1)] [&_h3]:my-1
                [&_p]:text-[var(--text-2)] [&_p]:my-1 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-1
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-1
                [&_li]:text-[var(--text-2)] [&_li]:my-0.5
                [&_strong]:font-bold [&_strong]:text-[var(--text-1)]
                [&_em]:italic [&_em]:text-[var(--text-2)]
                [&_u]:underline [&_u]:underline-offset-2
                [&_code]:bg-[var(--bg-0)] [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-[var(--accent)] [&_code]:text-sm
                [&_pre]:bg-[var(--bg-0)] [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-1
                [&_a]:text-[var(--accent)] [&_a]:underline
                ${language === 'np' ? 'text-lg' : 'text-base'}`}
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          ) : (
            <p className={`text-[var(--text-2)] leading-relaxed whitespace-pre-wrap ${language === 'np' ? 'text-lg' : 'text-base'}`}>
              {answer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
