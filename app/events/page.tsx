import { EventsClient } from '@/components/events/EventsClient';
import { listEvents } from '@/lib/data/source';

export const metadata = {
  title: 'Events — datacenter.observer',
  description: 'Public comment periods, hearings, protests, and votes for AI data center projects.',
};

export default function EventsPage() {
  // Pre-render the initial list server-side so the page is meaningful with JS disabled
  const initial = listEvents();
  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <header className="mb-8">
        <p className="font-display text-[11px] uppercase tracking-widest text-accent-cyan">
          Civic events
        </p>
        <h1 className="font-display text-3xl font-bold mt-1 text-slate-100">Events</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Upcoming public-comment windows, hearings, zoning votes, and grassroots actions related
          to AI data center projects. Showing up — and submitting comment, even in writing — is
          how local decisions get made.
        </p>
      </header>
      <EventsClient initial={initial} />
    </div>
  );
}
