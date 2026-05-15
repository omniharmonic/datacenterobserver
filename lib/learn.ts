import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const LEARN_DIR = path.join(process.cwd(), 'content', 'learn');

export interface LearnDoc {
  slug: string;
  title: string;
  summary: string;
  order: number;
  html: string;
}

export interface LearnIndexEntry {
  slug: string;
  title: string;
  summary: string;
  order: number;
}

export function listLearnDocs(): LearnIndexEntry[] {
  const files = fs.readdirSync(LEARN_DIR).filter((f) => f.endsWith('.md'));
  const docs: LearnIndexEntry[] = files.map((f) => {
    const raw = fs.readFileSync(path.join(LEARN_DIR, f), 'utf8');
    const { data } = matter(raw);
    return {
      slug: f.replace(/\.md$/, ''),
      title: String(data.title ?? f),
      summary: String(data.summary ?? ''),
      order: Number(data.order ?? 99),
    };
  });
  return docs.sort((a, b) => a.order - b.order);
}

export async function getLearnDoc(slug: string): Promise<LearnDoc | null> {
  const filepath = path.join(LEARN_DIR, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;
  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(raw);
  const html = String(await remark().use(remarkHtml).process(content));
  return {
    slug,
    title: String(data.title ?? slug),
    summary: String(data.summary ?? ''),
    order: Number(data.order ?? 99),
    html,
  };
}
