// Sticky table of contents for the generated plan. Uses IntersectionObserver
// to highlight whichever section is currently in view (scrollspy). Clicking
// an item scrolls to that section.

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  number: string;
  label: string;
}

const ITEMS: TocItem[] = [
  { id: 'plan-sec-1', number: '1.', label: 'Purpose & scope' },
  { id: 'plan-sec-2', number: '2.', label: 'Cyber Incident Response Team' },
  { id: 'plan-sec-3', number: '3.', label: 'External contacts' },
  { id: 'plan-sec-4', number: '4.', label: 'Severity classification' },
  { id: 'plan-sec-5', number: '5.', label: 'Escalation & authority' },
  { id: 'plan-sec-6', number: '6.', label: 'Incident response process' },
  { id: 'plan-sec-7', number: '7.', label: 'Playbooks' },
  { id: 'plan-sec-8', number: '8.', label: 'Communications' },
  { id: 'plan-sec-9', number: '9.', label: 'Critical systems & impact' },
  { id: 'plan-sec-10', number: '10.', label: 'Recovery & backups' },
  { id: 'plan-sec-11', number: '11.', label: 'Post-incident review' },
  { id: 'plan-sec-12', number: '12.', label: 'Plan maintenance' },
  { id: 'plan-sec-13', number: '13.', label: 'Mapping to standards' },
];

export function PlanToc() {
  const [activeId, setActiveId] = useState<string>(ITEMS[0]!.id);

  useEffect(() => {
    const headings = ITEMS.map((it) => document.getElementById(it.id)).filter(
      (el): el is HTMLElement => el != null,
    );
    if (headings.length === 0) return;

    // Find which heading is closest to (just above) the trigger line.
    const triggerY = 120;
    const onScroll = () => {
      let current = headings[0]!.id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= triggerY) {
          current = h.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="no-print sticky top-[80px] self-start">
      <div className="max-h-[calc(100vh-100px)] overflow-y-auto rounded-md border border-line bg-white p-3.5 shadow-card">
        <div className="mb-2 border-b border-line pb-2 text-[11px] font-bold uppercase tracking-[.06em] text-muted">
          Plan contents
        </div>
        <nav className="flex flex-col gap-px">
          {ITEMS.map((it) => {
            const active = activeId === it.id;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                onClick={(e) => onClick(e, it.id)}
                className={`block rounded-sm border-l-2 px-2.5 py-1.5 text-[13px] leading-snug no-underline transition ${
                  active
                    ? 'border-l-accent bg-[#eaf2fd] font-bold text-accent'
                    : 'border-l-transparent text-navy-2 hover:bg-[#f0f4fa] hover:text-accent hover:!no-underline'
                }`}
              >
                <span
                  className={`mr-1.5 inline-block w-[22px] text-xs font-semibold ${
                    active ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {it.number}
                </span>
                {it.label}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
