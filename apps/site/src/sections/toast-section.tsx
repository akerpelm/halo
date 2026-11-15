import { toast } from '@halo-ui/react/toast';
import { Button } from '../components/button';
import { CodeBlock } from '../components/code-block';
import { CompareTable } from '../components/compare-table';
import { FlickTest } from '../components/flick-test';
import { Section } from '../components/section';
import { CountUp } from '../components/count-up';
import { WallLabel } from '../components/wall-label';
import { demos } from '../lib/demo-toasts';

const usage = `import { Toaster, toast } from '@halo-ui/react/toast';
import '@halo-ui/react/styles.css';

export function App() {
  return (
    <>
      <Routes />
      <Toaster />
    </>
  );
}

toast.success('Invite sent');
toast.error('Upload failed', { action: { label: 'Retry', onClick: retry } });
toast.promise(publish(), {
  loading: 'Publishing…',
  success: 'Published',
  error: 'Could not publish',
});

const id = toast.loading('Exporting 0 of 3');
toast.update(id, 'Export ready', { type: 'success' });`;

const triggers = [
  ['Default', demos.default],
  ['Success', demos.success],
  ['Error with retry', demos.error],
  ['Warning', demos.warning],
  ['Info with action', demos.info],
  ['Promise', demos.promise],
  ['Update in place', demos.update],
  ['Long message', demos.long],
] as const;

export function ToastSection() {
  return (
    <Section
      id="toast"
      title="Toast"
      lede={
        <>
          <p className="m-0">One function you can call from anywhere. Toasts stack as a deck, fan out on hover or focus, and leave when you fling them.</p>
          <p className="m-0 mt-4">
            Press <kbd className="rounded-md bg-ink/[0.07] px-1.5 py-0.5 text-[14px]">Alt</kbd>+<kbd className="rounded-md bg-ink/[0.07] px-1.5 py-0.5 text-[14px]">T</kbd> to
            jump to the stack. Esc or Delete dismisses the focused toast.
          </p>
        </>
      }
      aside={
        <WallLabel
          title="Toast"
          date="2026"
          medium="Frosted pane, spring steel, two live regions"
          rows={[
            ['Import', <code key="i">@halo-ui/react/toast</code>],
            ['Weight', <span key="w"><CountUp value={5.7} decimals={1} suffix=" kB" /> min+gzip, with springs</span>],
            ['Styles', <span key="s"><CountUp value={2.9} decimals={1} suffix=" kB" />, shared with Drawer</span>],
            ['Peers', 'React 18.2 or newer'],
            ['Motion', 'Transform and opacity only'],
          ]}
        />
      }
    >
      <h3 className="m-0 text-[24px] font-semibold tracking-[-0.02em]">Flick test</h3>
      <p className="mt-2 mb-6 max-w-[60ch] text-[15px] leading-[1.55] text-ink-soft">
        One gesture drives both chips. When you let go, each library decides what happens, using its own rules on exactly the same
        input.
      </p>
      <FlickTest />

      <h3 className="mt-16 mb-6 text-[24px] font-semibold tracking-[-0.02em]">Try every type</h3>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Show an example toast">
        {triggers.map(([label, fire]) => (
          <Button key={label} size="md" onClick={() => fire()}>
            {label}
          </Button>
        ))}
        <Button size="md" tone="outline" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </div>

      <CodeBlock className="mt-8" label="app.tsx" code={usage} />

      <div className="mt-16">
        <CompareTable
          caption="How Halo behaves next to Sonner, checked against Sonner's source."
          them="Sonner"
          rows={[
            ['Flick speed', 'Distance divided by the whole gesture time, so a slow drag that ends in a flick reads as slow.', 'A line fitted through the last 80 ms of pointer samples.'],
            ['After you let go', 'Fixed CSS transitions: a 200 ms exit, a timed snap-back.', 'A spring that starts at your release speed and keeps going.'],
            ['Interruptions', 'A new CSS transition starts from rest.', 'Retargeting keeps the current velocity, so motion never stalls.'],
            ['Stack layout', 'Transitions on transform, opacity, and height.', 'Transform and opacity only. Height clips are offset inside the spring.'],
            ['Hidden toasts', 'Timers run for toasts tucked behind the deck.', 'A toast only counts down while it is visible.'],
            ['Screen readers', 'One polite live region for every type.', 'Polite and assertive regions. Errors interrupt, and every type is announced by name.'],
            ['Time left', 'Not shown.', 'The status icon empties like a timer, and freezes while you read. Or put the ring on the close button.'],
          ]}
        />
      </div>
    </Section>
  );
}
