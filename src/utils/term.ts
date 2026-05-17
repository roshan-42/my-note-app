import type { Faculty, TermType } from '../types';

export function termLabel(termType: TermType | undefined, n: number, short = false): string {
  const t = termType || 'year';
  if (t === 'semester') return short ? `Sem ${n}` : `Semester ${n}`;
  return short ? `Yr ${n}` : `Year ${n}`;
}

export function termLabelPlural(termType: TermType | undefined, count: number): string {
  const t = termType || 'year';
  const word = t === 'semester' ? 'semester' : 'year';
  return `${count} ${word}${count !== 1 ? 's' : ''}`;
}

export function termNoun(termType: TermType | undefined, capitalize = false): string {
  const t = termType || 'year';
  const w = t === 'semester' ? 'semester' : 'year';
  return capitalize ? w[0].toUpperCase() + w.slice(1) : w;
}

export function facultyTerm(f: Faculty | undefined): TermType {
  return f?.termType || 'year';
}
