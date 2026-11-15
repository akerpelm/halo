import { CodeBlock } from '../components/code-block';
import { CompareTable } from '../components/compare-table';
import { DemoDrawer } from '../components/demo-drawer';
import { Link } from '../components/link';
import { Section } from '../components/section';
import { CountUp } from '../components/count-up';
import { HungLabel } from '../components/hung-label';
import { defaultDrawerConfig, drawerCode } from '../lib/config';
import { useSettings } from '../lib/settings';

const steps = [
  ['Sample', 'While you drag, Halo records where the pane is and when, and keeps only the last 80 ms.'],
  ['Project', 'When you let go, it works out where a flick that fast would coast to, the way a scroll view does.'],
  ['Settle', 'It picks the snap point nearest that landing spot and hands your velocity to a spring, so the pane keeps moving instead of restarting.'],
] as const;

export function DrawerSection() {
  const { world } = useSettings();
  return (
    <Section
      id="drawer"
      title="Drawer"
      lede={
        <p className="m-0">
          A sheet from any edge, built on the native <code className="text-body">&lt;dialog&gt;</code>. That gives you the top layer, a real focus
          trap, and Esc for free, with no portal and no Radix underneath.
        </p>
      }
      aside={
        <HungLabel
          title="Drawer"
          date="2026"
          medium="Native dialog, spring steel, projected detents"
          rows={[
            ['Import', <code key="i">@halo-ui/react/drawer</code>],
            ['Weight', <span key="w"><CountUp value={4.8} decimals={1} suffix=" kB" /> min+gzip, with springs</span>],
            ['Edges', 'Bottom, top, left, right'],
            ['Detents', 'Viewport fractions or px'],
            ['Keyboard', 'Handle is a button, arrows step'],
          ]}
        />
      }
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label="Open an example drawer">
        <DemoDrawer trigger="Sheet with two detents" size="md" />
        <DemoDrawer trigger="Three detents" size="md" config={{ ...defaultDrawerConfig, snapPoints: 'three' }} />
        <DemoDrawer trigger="Side panel" size="md" config={{ ...defaultDrawerConfig, side: 'right', snapPoints: 'none', recess: false }} />
        <DemoDrawer trigger="Must choose" size="md" tone="outline" config={{ ...defaultDrawerConfig, snapPoints: 'none', dismissible: false }} />
      </div>

      <ol className="m-0 mt-12 grid list-none gap-8 p-0 sm:grid-cols-3" aria-label="How a release becomes motion">
        {steps.map(([title, body], index) => (
          <li key={title}>
            <p className="m-0 font-mono text-caption text-ink-faint tabular-nums">{index + 1}</p>
            <h3 className="m-0 mt-2 text-title font-semibold tracking-[-0.015em]">{title}</h3>
            <p className="m-0 mt-2 text-body leading-[1.55] text-ink-soft">{body}</p>
          </li>
        ))}
      </ol>

      <CodeBlock className="mt-12" label="share-sheet.tsx" code={drawerCode(defaultDrawerConfig, world)} />

      <p className="mt-8 mb-0 text-body text-ink-soft">
        Parts, props, and detents are in the{' '}
        <Link href="/docs/drawer" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          Drawer docs
        </Link>
        .
      </p>

      <div className="mt-16">
        <CompareTable
          caption="How Halo behaves next to Vaul, checked against Vaul's source. Vaul's README now says it is unmaintained."
          them="Vaul"
          rows={[
            ['Foundation', 'Radix Dialog with a portal.', 'The native dialog element. No dependencies besides React.'],
            ['After you let go', 'Every release plays the same 0.5 s cubic-bezier.', 'A spring that starts at your release speed.'],
            ['Choosing a detent', 'Threshold rules, such as skipping to the end when velocity is over 2.', 'The detent nearest where your flick would coast to.'],
            ['Overscroll', 'Dampened drag past the edge.', 'Rubber-banding, plus a strip of pane past the edge so no gap ever shows.'],
            ['Handle', 'An aria-hidden div. Clicking cycles detents, but the keyboard cannot reach it.', 'A real button. Press it, or use the arrow keys, to change size.'],
          ]}
        />
      </div>
    </Section>
  );
}
