import type { PropRow } from './api';

/** A stable anchor for each prop, so any row can be linked to. */
export const propId = (name: string) => `prop-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

/**
 * A prop reference: one real table, so every row keeps a single linkable id.
 * On phones the same rows restyle into stacked blocks instead of scrolling sideways. Explicit ARIA
 * roles keep it a table for screen readers, since some browsers drop table semantics on display changes.
 */
export function PropTable({ rows, caption, nameLabel = 'Prop' }: { rows: readonly PropRow[]; caption: string; nameLabel?: string }) {
  const hasDefault = rows.some((r) => r.default);
  return (
    <table role="table" className="my-3 w-full border-collapse text-left max-md:block">
      <caption className="sr-only">{caption}</caption>
      <thead role="rowgroup" className="max-md:hidden">
        <tr role="row" className="border-b border-[color-mix(in_oklch,currentColor_14%,transparent)] text-label text-[var(--halo-fg-muted,var(--ink-faint))]">
          <th role="columnheader" scope="col" className="w-[30%] py-2 pr-4 font-medium">
            {nameLabel}
          </th>
          <th role="columnheader" scope="col" className="w-[30%] py-2 pr-4 font-medium">
            Type
          </th>
          {hasDefault && (
            <th role="columnheader" scope="col" className="py-2 pr-4 font-medium">
              Default
            </th>
          )}
          <th role="columnheader" scope="col" className="py-2 font-medium">
            Description
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup" className="max-md:block">
        {rows.map((row) => (
          <tr
            role="row"
            key={row.name}
            id={propId(row.name)}
            className="scroll-mt-32 border-b border-[color-mix(in_oklch,currentColor_12%,transparent)] align-top last:border-0 max-md:block max-md:py-3 lg:scroll-mt-24 target:bg-[color-mix(in_oklch,currentColor_6%,transparent)]"
          >
            <th role="rowheader" scope="row" className="py-3 pr-4 font-mono text-label font-medium break-words max-md:block max-md:p-0">
              <a href={`#${propId(row.name)}`} className="text-[var(--halo-fg,var(--ink))] no-underline hover:underline hover:underline-offset-4">
                {row.name}
              </a>
            </th>
            <td role="cell" className="py-3 pr-4 font-mono text-caption leading-[1.6] break-words text-[var(--halo-fg-muted,var(--ink-soft))] max-md:mt-1 max-md:block max-md:p-0">
              {row.type}
            </td>
            {hasDefault && (
              <td role="cell" className="py-3 pr-4 font-mono text-caption text-[var(--halo-fg-muted,var(--ink-soft))] max-md:block max-md:p-0">
                <span className="md:hidden">default </span>
                {row.default ?? '–'}
              </td>
            )}
            <td role="cell" className="py-3 text-ui leading-[1.55] text-[var(--halo-fg-muted,var(--ink-soft))] max-md:mt-1 max-md:block max-md:p-0">{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
