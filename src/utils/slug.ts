export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function uniqueSlug(base: string, existing: string[]): string {
  const root = slugify(base) || 'item';
  if (!existing.includes(root)) return root;
  let i = 2;
  while (existing.includes(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}
