import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const BATCH_LIMIT = 450;

interface DeleteResult {
  subjects: number;
  chapters: number;
  notes: number;
  questions: number;
}

async function commitInBatches(refs: { col: string; id: string }[]): Promise<void> {
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const slice = refs.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db as Firestore);
    slice.forEach(({ col, id }) => batch.delete(doc(db, col, id)));
    await batch.commit();
  }
}

async function idsForChapters(chapterIds: string[]) {
  const refs: { col: string; id: string }[] = [];
  if (chapterIds.length === 0) return { refs, noteCount: 0, qCount: 0 };

  for (let i = 0; i < chapterIds.length; i += 10) {
    const slice = chapterIds.slice(i, i + 10);
    const [notesSnap, qsSnap] = await Promise.all([
      getDocs(query(collection(db, 'notes'), where('chapterId', 'in', slice))),
      getDocs(query(collection(db, 'questions'), where('chapterId', 'in', slice))),
    ]);
    notesSnap.forEach(d => refs.push({ col: 'notes', id: d.id }));
    qsSnap.forEach(d => refs.push({ col: 'questions', id: d.id }));
  }
  const noteCount = refs.filter(r => r.col === 'notes').length;
  const qCount = refs.filter(r => r.col === 'questions').length;
  return { refs, noteCount, qCount };
}

async function idsForSubjects(subjectIds: string[]) {
  const allRefs: { col: string; id: string }[] = [];
  const chapterIds: string[] = [];
  if (subjectIds.length === 0) return { refs: allRefs, chapterIds, chapterCount: 0 };

  for (let i = 0; i < subjectIds.length; i += 10) {
    const slice = subjectIds.slice(i, i + 10);
    const snap = await getDocs(query(collection(db, 'chapters'), where('subjectId', 'in', slice)));
    snap.forEach(d => {
      chapterIds.push(d.id);
      allRefs.push({ col: 'chapters', id: d.id });
    });
  }
  return { refs: allRefs, chapterIds, chapterCount: chapterIds.length };
}

export async function cascadeDeleteChapter(chapterId: string): Promise<DeleteResult> {
  const result: DeleteResult = { subjects: 0, chapters: 1, notes: 0, questions: 0 };
  const { refs, noteCount, qCount } = await idsForChapters([chapterId]);
  result.notes = noteCount;
  result.questions = qCount;
  refs.push({ col: 'chapters', id: chapterId });
  await commitInBatches(refs);
  return result;
}

export async function cascadeDeleteSubject(subjectId: string): Promise<DeleteResult> {
  const result: DeleteResult = { subjects: 1, chapters: 0, notes: 0, questions: 0 };
  const { refs: chapterRefs, chapterIds, chapterCount } = await idsForSubjects([subjectId]);
  result.chapters = chapterCount;
  const { refs: descRefs, noteCount, qCount } = await idsForChapters(chapterIds);
  result.notes = noteCount;
  result.questions = qCount;
  const all = [...descRefs, ...chapterRefs, { col: 'subjects', id: subjectId }];
  await commitInBatches(all);
  return result;
}

export async function cascadeDeleteFaculty(facultyId: string): Promise<DeleteResult> {
  const result: DeleteResult = { subjects: 0, chapters: 0, notes: 0, questions: 0 };

  const subjSnap = await getDocs(query(collection(db, 'subjects'), where('facultyId', '==', facultyId)));
  const subjectIds: string[] = [];
  const subjectRefs: { col: string; id: string }[] = [];
  subjSnap.forEach(d => {
    subjectIds.push(d.id);
    subjectRefs.push({ col: 'subjects', id: d.id });
  });
  result.subjects = subjectIds.length;

  const { refs: chapterRefs, chapterIds, chapterCount } = await idsForSubjects(subjectIds);
  result.chapters = chapterCount;

  const { refs: descRefs, noteCount, qCount } = await idsForChapters(chapterIds);
  result.notes = noteCount;
  result.questions = qCount;

  const all = [...descRefs, ...chapterRefs, ...subjectRefs, { col: 'faculties', id: facultyId }];
  await commitInBatches(all);

  return result;
}

export function formatCascadeSummary(r: DeleteResult): string {
  const parts: string[] = [];
  if (r.subjects) parts.push(`${r.subjects} subject${r.subjects !== 1 ? 's' : ''}`);
  if (r.chapters) parts.push(`${r.chapters} chapter${r.chapters !== 1 ? 's' : ''}`);
  if (r.notes) parts.push(`${r.notes} note${r.notes !== 1 ? 's' : ''}`);
  if (r.questions) parts.push(`${r.questions} question${r.questions !== 1 ? 's' : ''}`);
  return parts.length > 0 ? `Removed ${parts.join(', ')}` : 'No children to remove';
}
