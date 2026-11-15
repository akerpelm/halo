import type { PropRow } from './api';

/** A prop reference. A table on wide screens, stacked rows on phones, so nothing scrolls sideways. */
export function PropTable({ rows, caption, nameLabel = 'Prop' }: { rows: readonly PropRow[]; caption: string; nameLabel?: string }) {
  const hasDefault = rows.some((r) => r.default);
  return (
    <div className="my-6">
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-label text-ink-faint">
            <th scope="col" className="w-[30%] py-2 pr-4 font-medium">
              {nameLabel}
            </th>
            <th scope="col" className="w-[30%] py-2 pr-4 font-medium">
              Type
            </th>
            {hasDefault && (
              <th scope="col" className="py-2 pr-4 font-medium">
                Default
              </th>
            )}
            <th scope="col" className="py-2 font-medium">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-line align-top last:border-0">
              <th scope="row" className="py-3 pr-4 font-mono text-label font-medium break-words text-ink">
                {row.name}
              </th>
              <td className="py-3 pr-4 font-mono text-caption leading-[1.6] break-words text-ink-soft">{row.type}</td>
              {hasDefault && <td className="py-3 pr-4 font-mono text-caption text-ink-soft">{row.default ?? '–'}</td>}
              <td className="py-3 text-ui leading-[1.55] text-ink-soft">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="m-0 md:hidden">
        {rows.map((row) => (
          <div key={row.name} className="border-b border-line py-3 last:border-0">
            <dt className="font-mono text-label font-medium break-words text-ink">{row.name}</dt>
            <dd className="m-0 mt-1 grid gap-1">
              <span className="font-mono text-caption break-words text-ink-soft">
                {row.type}
                {row.default && <span className="text-ink-faint"> · default {row.default}</span>}
              </span>
              <span className="text-ui leading-[1.55] text-ink-soft">{row.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
