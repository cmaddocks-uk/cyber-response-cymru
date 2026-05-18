// React renderer for IncidentReport trees. Pure rendering — no business
// logic. Walks the document model and emits .plan-doc / .doc-cover / .sev-*
// markup so the existing print stylesheet handles page-safety automatically.
//
// The same tree feeds the docx exporter (src/lib/document-model/word.ts);
// keep the two renderers in lockstep so a screen-print PDF and a downloaded
// Word document carry the same content with the same hierarchy.

import { forwardRef, type ReactNode } from 'react';
import type {
  Block,
  BodySection,
  CoverSection,
  IncidentReport,
  MetricCard,
  Section,
  Severity,
  TableRow,
  TimelineEvent,
} from '~/lib/document-model/types';
import { SEVERITY_TOKENS } from '~/lib/document-model/theme';

interface Props {
  report: IncidentReport;
}

export const DocumentRenderer = forwardRef<HTMLDivElement, Props>(function DocumentRenderer(
  { report },
  ref,
) {
  return (
    <div ref={ref} className="plan-doc rounded-md border border-line bg-white p-7">
      {report.sections.map((section, idx) => (
        <SectionView key={idx} section={section} />
      ))}
      {report.footer && (
        <div className="plan-doc-footer mt-8 border-t border-line pt-3 text-center text-[11px] text-muted">
          {report.footer}
        </div>
      )}
    </div>
  );
});

function SectionView({ section }: { section: Section }): ReactNode {
  return section.kind === 'cover' ? <CoverView cover={section} /> : <BodyView body={section} />;
}

function CoverView({ cover }: { cover: CoverSection }) {
  // Editorial cover. Top hero (logo, title, school, audience), middle gap,
  // lower single inline metadata row, bottom subtle rule + "Prepared by …".
  // No cards. No coloured boxes. No dashboard treatment.
  const metaLine = (cover.meta ?? [])
    .map((m) => m.value.trim())
    .filter((v) => v !== '')
    .join('   •   ');
  const preparedBy = cover.subtitle?.split('·')[0]?.trim() ?? '';

  return (
    <div className="doc-cover">
      <div className="doc-cover-hero">
        {cover.logo && <img src={cover.logo} alt="School logo" className="doc-cover-logo" />}
        <h1 className="doc-cover-title">{cover.title}</h1>
        {cover.subtitle && <p className="doc-cover-subtitle">{cover.subtitle}</p>}
        <p className="doc-cover-preparedfor">Prepared for Governors &amp; Senior Leadership</p>
        {metaLine && <p className="doc-cover-meta">{metaLine}</p>}
      </div>
      <div className="doc-cover-footer">
        <hr className="doc-cover-rule" aria-hidden="true" />
        <p className="doc-cover-preparedby">
          Prepared by {preparedBy || 'the school'}
        </p>
      </div>
    </div>
  );
}

function BodyView({ body }: { body: BodySection }) {
  return (
    <section className="doc-section" id={body.anchor}>
      <h2 className="doc-section-title">{body.title}</h2>
      {body.lede && <p className="doc-section-lede">{body.lede}</p>}
      {body.blocks.map((block, idx) => (
        <BlockView key={idx} block={block} />
      ))}
    </section>
  );
}

function BlockView({ block }: { block: Block }): ReactNode {
  switch (block.kind) {
    case 'heading': {
      const Tag = (`h${block.level}` as 'h2' | 'h3' | 'h4');
      return <Tag>{block.text}</Tag>;
    }
    case 'paragraph':
      return block.callout ? (
        <CalloutView severity={block.callout} body={block.text} />
      ) : (
        // `whiteSpace: pre-wrap` preserves newlines from user-entered
        // multi-line content (playbook school-specific notes, comms templates,
        // anywhere a structured "Label: value" block is rendered).
        <p style={{ whiteSpace: 'pre-wrap' }}>{block.text}</p>
      );
    case 'callout':
      return <CalloutView severity={block.severity} title={block.title} body={block.body} />;
    case 'bullets':
      return block.ordered ? (
        <ol>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case 'keyValue':
      return (
        <table className="doc-kv">
          <tbody>
            {block.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td>{r.value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'table':
      return (
        <>
          {block.caption && <p className="doc-table-caption">{block.caption}</p>}
          <table className="doc-table">
            <colgroup>
              {(block.widths ?? block.columns.map(() => 1 / block.columns.length)).map((w, i) => (
                <col key={i} style={{ width: `${w * 100}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {block.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <TableRowView key={i} row={row} index={i} />
              ))}
            </tbody>
          </table>
        </>
      );
    case 'spacer':
      return <div className="doc-spacer" aria-hidden="true" />;
    case 'metricCards':
      return (
        <div className="doc-cards">
          {block.cards.map((c, i) => (
            <MetricCardView key={i} card={c} />
          ))}
        </div>
      );
    case 'progress':
      return <ProgressView block={block} />;
    case 'timeline':
      return (
        <ol className="doc-timeline">
          {block.events.map((e, i) => (
            <TimelineRow key={i} event={e} />
          ))}
        </ol>
      );
    case 'divider':
      return (
        <div className={`doc-divider ${block.label ? 'doc-divider-labelled' : ''}`}>
          {block.label && <span className="doc-divider-label">{block.label}</span>}
        </div>
      );
  }
}

function CalloutView({ severity, body, title }: { severity: Severity; body: string; title?: string }) {
  return (
    <div className={`doc-callout doc-callout-${severity}`}>
      {title && <div className="doc-callout-title">{title}</div>}
      <p className="doc-callout-body">{body}</p>
    </div>
  );
}

function TableRowView({ row, index }: { row: TableRow; index: number }) {
  const sev = row.severity;
  const className = sev ? `doc-row doc-row-${sev}` : index % 2 === 1 ? 'doc-row doc-row-zebra' : 'doc-row';
  return (
    <tr className={className}>
      {row.cells.map((cell, i) => (
        <td key={i}>
          {i === 0 && sev ? (
            <span className={`sev-badge sev-${sev}`}>
              <span className="sev-letter" aria-hidden="true">
                {SEVERITY_TOKENS[sev].letter}
              </span>
              {cell}
            </span>
          ) : (
            <span className="whitespace-pre-line">{cell}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

function MetricCardView({ card }: { card: MetricCard }) {
  const sev = card.severity;
  return (
    <div className={`doc-card ${sev ? `doc-card-${sev}` : ''}`}>
      <div className="doc-card-label">{card.label}</div>
      <div className="doc-card-value">{card.value}</div>
      {card.hint && <div className="doc-card-hint">{card.hint}</div>}
    </div>
  );
}

function ProgressView({ block }: { block: { label: string; value: number; trailing?: string; severity?: Severity } }) {
  const pct = Math.max(0, Math.min(1, block.value)) * 100;
  const sev = block.severity ?? 'navy';
  return (
    <div className="doc-progress">
      <div className="doc-progress-head">
        <span className="doc-progress-label">{block.label}</span>
        <span className="doc-progress-trailing">{block.trailing ?? `${Math.round(pct)}%`}</span>
      </div>
      <div className={`doc-progress-track doc-progress-${sev}`}>
        <div className="doc-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TimelineRow({ event }: { event: TimelineEvent }) {
  const sev = event.severity ?? 'navy';
  return (
    <li className={`doc-timeline-row doc-timeline-${sev}`}>
      <span className="doc-timeline-time">{event.time}</span>
      <span className="doc-timeline-dot" aria-hidden="true" />
      <div className="doc-timeline-body">
        <div className="doc-timeline-title">{event.title}</div>
        {event.body && <div className="doc-timeline-detail">{event.body}</div>}
      </div>
    </li>
  );
}
