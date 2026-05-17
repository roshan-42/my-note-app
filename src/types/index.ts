export interface Faculty {
  id: string;
  name_en: string;
  name_np: string;
  slug: string;
  description_en: string;
  description_np: string;
  totalYears: number;
  icon: string;
  accent: string;
  order: number;
  createdAt?: Date;
}

export interface Subject {
  id: string;
  facultyId: string;
  year: number;
  name_en: string;
  name_np: string;
  slug: string;
  icon?: string;
  createdAt?: Date;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title_en: string;
  title_np: string;
  slug: string;
  order: number;
  createdAt?: Date;
}

export interface Note {
  id: string;
  chapterId: string;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExamQuestion {
  id: string;
  chapterId: string;
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
  createdAt?: Date;
}

export type Language = 'en' | 'np';
export type ThemeName = 'amber' | 'royal' | 'emerald' | 'crimson';
