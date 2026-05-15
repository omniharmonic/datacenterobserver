import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getLearnDoc, listLearnDocs } from '@/lib/learn';

export async function generateStaticParams() {
  return listLearnDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getLearnDoc(slug);
  if (!doc) return { title: 'Learn — datacenter.observer' };
  return {
    title: `${doc.title} — datacenter.observer`,
    description: doc.summary,
  };
}

export default async function LearnArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getLearnDoc(slug);
  if (!doc) notFound();

  return (
    <article className="max-w-3xl mx-auto px-5 py-10">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent-cyan font-display"
      >
        <ArrowLeft size={12} /> All articles
      </Link>
      <header className="mt-6 mb-8">
        <p className="font-display text-[11px] uppercase tracking-widest text-accent-cyan">
          Article {doc.order}
        </p>
        <h1 className="font-display text-3xl font-bold mt-1 text-slate-100 leading-tight">
          {doc.title}
        </h1>
        <p className="text-base text-slate-400 mt-3 leading-relaxed">{doc.summary}</p>
      </header>
      <div className="prose-doc" dangerouslySetInnerHTML={{ __html: doc.html }} />
      <div className="mt-10 pt-6 border-t border-border text-xs text-slate-600">
        Open source · CC BY-SA 4.0 · suggestions welcome via GitHub.
      </div>
    </article>
  );
}
