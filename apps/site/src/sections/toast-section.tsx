import type { MouseEvent } from 'react';
import { Button } from '../components/button';
import { FlickTest } from '../components/flick-test';
import { Link } from '../components/link';
import { Section } from '../components/section';
import { CountUp } from '../components/count-up';
import { HungLabel } from '../components/hung-label';
import { newDemos } from '../lib/demo-toasts';
import { reactPeer, sizes } from '../lib/package-facts';

export function ToastSection() {
  return (
    <Section
      id="toast"
      title="Toast"
      lede={
        <>
          <p className="m-0">One function you can call from anywhere. Toasts stack as a deck, fan out on hover or focus, and leave when you fling them.</p>
          <p className="m-0 mt-4">
            Press <kbd className="rounded-md bg-ink/[0.07] px-1.5 py-0.5 text-ui">Alt</kbd>+<kbd className="rounded-md bg-ink/[0.07] px-1.5 py-0.5 text-ui">T</kbd> to
            jump to the stack. Esc or Delete dismisses the focused toast.
          </p>
        </>
      }
      aside={
        <HungLabel
          title="Toast"
          date="2026"
          medium="Frosted glass, spring physics, polite and assertive live regions"
          rows={[
            ['Import', <code key="i">halo-ui-react/toast</code>],
            ['Weight', <span key="w"><CountUp value={sizes.toast} decimals={1} suffix=" kB" /> min+gzip, with springs</span>],
            ['Styles', <span key="s"><CountUp value={sizes.styles} decimals={1} suffix=" kB" />, shared with Drawer</span>],
            ['Peers', `React ${reactPeer} or newer`],
            ['Motion', 'Transform and opacity only'],
          ]}
        />
      }
    >
      <h3 className="m-0 text-heading font-semibold tracking-[-0.02em]">Flick test</h3>
      <p className="mt-2 mb-6 max-w-[60ch] text-body leading-[1.55] text-ink-soft">
        One gesture drives both chips. When you let go, each library decides what happens, using its own rules on exactly the same
        input.
      </p>
      <p className="mt-0 mb-6 max-w-[60ch] text-body leading-[1.55] text-ink">
        Sonner dismisses any drag past 45 px, even a slow one you meant to take back, and averages speed over the whole drag, so a short flick after a
        pause reads as slow. Halo measures the last 80 ms and projects where the toast would land.
      </p>
      <FlickTest />

      <h3 className="mt-16 mb-2 text-heading font-semibold tracking-[-0.02em]">Four toasts you’d otherwise build yourself</h3>
      <p className="mt-0 mb-6 max-w-[60ch] text-body leading-[1.55] text-ink-soft">Each is one call, with the motion, timing and announcements already handled.</p>
      <dl className="m-0 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {(
          [
            ['Launch from the trigger', 'toast(title, { from })', 'The toast flies out of the button that caused it.', (event: MouseEvent<HTMLButtonElement>) => newDemos.launch(event.currentTarget), 'Launch one'],
            ['Streaming text', 'toast.stream(reply)', 'Words arrive live, like a model replying, then it settles.', () => newDemos.stream(), 'Stream a reply'],
            ['Undo with a countdown', 'toast.undo(title, { onUndo })', 'The countdown sits on the Undo button: the timer is the window.', () => newDemos.undo(), 'Archive something'],
            ['Grouped repeats', 'toast(title, { group })', 'Repeats collapse into one toast with a springing count.', () => newDemos.group(), 'Upload a file'],
          ] as const
        ).map(([term, code, detail, fire, action]) => (
          <div key={term} className="grid content-start gap-2 border-t border-line pt-4">
            <dt className="font-display text-title font-semibold tracking-[-0.015em]">{term}</dt>
            <dd className="m-0 grid gap-3">
              <code className="text-label text-ink-faint">{code}</code>
              <span className="text-body leading-[1.5] text-pretty text-ink-soft">{detail}</span>
              <Button size="sm" className="justify-self-start" onClick={fire}>
                {action}
              </Button>
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-12 mb-0 text-body text-ink-soft">
        Every type, option, and prop, and how it compares with Sonner, is in the{' '}
        <Link href="/docs/toast" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          Toast docs
        </Link>
        .
      </p>
    </Section>
  );
}
