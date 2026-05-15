import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { listLearnDocs } from '@/lib/learn';

export const metadata = {
  title: 'Learn — datacenter.observer',
  description:
    'Educational primers on AI data centers, the permitting process, the money behind them, and how to participate.',
};

export default function LearnIndex() {
  const docs = listLearnDocs();
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <header className="mb-8">
        <p className="font-display text-[11px] uppercase tracking-widest text-accent-cyan">Learn</p>
        <h1 className="font-display text-3xl font-bold mt-1 text-slate-100">
          Understand the build, then move on it.
        </h1>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          Four short primers covering what AI data centers actually are, how they get approved,
          who's paying for them, and the practical mechanics of participating in local decisions.
          None of this is technical — it's the working vocabulary local organizers and reporters
          have asked us for.
        </p>
      </header>
      <ul className="space-y-2">
        {docs.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/learn/${d.slug}`}
              className="block bg-bg-surface border border-border hover:border-accent-cyan/40 rounded-lg p-5 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[10px] uppercase tracking-widest text-slate-500">
                    Article {d.order}
                  </p>
                  <h2 className="font-display text-lg font-semibold text-slate-100 mt-0.5 group-hover:text-accent-cyan transition-colors">
                    {d.title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{d.summary}</p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-slate-600 group-hover:text-accent-cyan transition-colors mt-1 shrink-0"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex items-center gap-2 text-slate-600 text-xs">
        <BookOpen size={14} />
        More articles forthcoming. Contributions welcome — see the GitHub repo.
      </div>
    </div>
  );
}
