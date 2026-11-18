import { Swipe } from 'halo-ui-react/swipe';
import { toast } from 'halo-ui-react/toast';
import { useState } from 'react';
import { useSettings } from '../lib/settings';

type Invoice = { id: number; client: string; amount: string; due: string };

const invoices: readonly Invoice[] = [
  { id: 1042, client: 'Northwind Studio', amount: '$1,200', due: 'Due Friday' },
  { id: 1043, client: 'Harbor & Pine', amount: '$860', due: 'Due Nov 28' },
  { id: 1044, client: 'Lumen Labs', amount: '$4,350', due: 'Paid' },
  { id: 1045, client: 'Okafor Design', amount: '$2,075', due: 'Due Dec 2' },
];

export function DemoSwipe({ hint = false }: { hint?: boolean }) {
  const { world, theme } = useSettings();
  const [items, setItems] = useState(invoices);
  const [flagged, setFlagged] = useState<ReadonlySet<number>>(new Set());

  const archive = (invoice: Invoice) => {
    setItems((all) => all.filter((other) => other.id !== invoice.id));
    toast.undo(`Invoice ${invoice.id} archived`, {
      onUndo: () => setItems((all) => invoices.filter((item) => item.id === invoice.id || all.includes(item))),
    });
  };

  const toggleFlag = (invoice: Invoice) =>
    setFlagged((current) => {
      const next = new Set(current);
      if (next.has(invoice.id)) next.delete(invoice.id);
      else next.add(invoice.id);
      return next;
    });

  if (items.length === 0) {
    return (
      <div className="flex min-h-[132px] flex-col items-start justify-center gap-3 rounded-[18px] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
        <p className="m-0 text-body text-ink-soft">Every invoice is archived.</p>
        <button type="button" className="cursor-pointer text-ui font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink" onClick={() => setItems(invoices)}>
          Bring them back
        </button>
      </div>
    );
  }

  return (
    <Swipe.Group aria-label="Invoices" hint={hint} world={world} theme={theme}>
      {items.map((invoice) => {
        const isFlagged = flagged.has(invoice.id);
        return (
          <Swipe.Root key={invoice.id}>
            <Swipe.Content className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="m-0 flex items-center gap-2 text-ui font-medium">
                  <span className="truncate">{invoice.client}</span>
                  {isFlagged && <span className="flex-none rounded-full bg-[color-mix(in_oklch,var(--halo-fg)_9%,transparent)] px-2 text-caption">Flagged</span>}
                </p>
                <p className="m-0 mt-0.5 text-label text-[var(--halo-fg-muted)]">
                  Invoice {invoice.id} · {invoice.due}
                </p>
              </div>
              <span className="flex-none font-mono text-label tabular-nums">{invoice.amount}</span>
            </Swipe.Content>
            <Swipe.Actions side="end">
              <Swipe.Action aria-label={`${isFlagged ? 'Unflag' : 'Flag'} invoice ${invoice.id}`} announce={`Invoice ${invoice.id} ${isFlagged ? 'unflagged' : 'flagged'}`} onClick={() => toggleFlag(invoice)}>
                {isFlagged ? 'Unflag' : 'Flag'}
              </Swipe.Action>
              <Swipe.Action commit aria-label={`Archive invoice ${invoice.id}`} onClick={() => archive(invoice)}>
                Archive
              </Swipe.Action>
            </Swipe.Actions>
          </Swipe.Root>
        );
      })}
    </Swipe.Group>
  );
}
