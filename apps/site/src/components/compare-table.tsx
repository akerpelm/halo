type CompareTableProps = {
  caption: string;
  them: string;
  rows: ReadonlyArray<readonly [string, string, string]>;
};

/** Side-by-side behavior, checked against the other library's source. */
export function CompareTable({ caption, them, rows }: CompareTableProps) {
  return (
    <>
      {/* Phones: each topic becomes a stacked pair, so no column is ever clipped. */}
      <div className="sm:hidden">
        <p className="mt-0 mb-3 text-label text-ink-faint">{caption}</p>
        <dl className="m-0">
          {rows.map(([topic, theirs, ours]) => (
            <div key={topic} className="border-b border-line py-4 last:border-0">
              <dt className="text-body font-semibold text-ink">{topic}</dt>
              <dd className="m-0 mt-2 grid grid-cols-[64px_1fr] gap-x-3 gap-y-1.5 text-ui leading-[1.5]">
                <span className="text-ink-faint">{them}</span>
                <span className="text-ink-soft">{theirs}</span>
                <span className="font-medium text-ink">Halo</span>
                <span className="text-ink">{ours}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <table className="hidden w-full border-collapse text-left text-ui leading-[1.5] sm:table">
        <caption className="mb-3 text-left text-label text-ink-faint">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="w-[24%] py-2.5 pr-4 font-medium text-ink-faint">
              <span className="sr-only">Behaviour</span>
            </th>
            <th scope="col" className="w-[38%] py-2.5 pr-4 font-medium text-ink-faint">
              {them}
            </th>
            <th scope="col" className="py-2.5 font-semibold text-ink">
              Halo
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([topic, theirs, ours]) => (
            <tr key={topic} className="border-b border-line align-top last:border-0">
              <th scope="row" className="py-3.5 pr-4 font-medium text-ink">
                {topic}
              </th>
              <td className="py-3.5 pr-4 text-ink-soft">{theirs}</td>
              <td className="py-3.5 text-ink">{ours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
