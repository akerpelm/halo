import { Toaster, toast } from '@halo-ui/react/toast';
import { Button } from '../components/button';
import { CodeBlock } from '../components/code-block';
import { Section } from '../components/section';
import { useSettings } from '../lib/settings';

const writeWorld = `/* your global CSS: this is the whole Midnight world */
[data-halo-world='midnight'] {
  color-scheme: dark;
  --halo-surface: oklch(24% 0.06 278 / 0.74);
  --halo-surface-solid: oklch(21% 0.06 278);
  --halo-fg: oklch(96% 0.02 280);
  --halo-fg-muted: oklch(80% 0.05 280);
  --halo-blur: 24px;
  --halo-radius: 14px;
  --halo-world-edge: linear-gradient(to bottom,
    oklch(82% 0.12 290 / 0.65), oklch(62% 0.16 305 / 0.18));
  --halo-shadow: 0 22px 44px -22px oklch(22% 0.12 285 / 0.75);
}

<Toaster world="midnight" />`;

const extendWorld = `/* Change a built-in world everywhere */
[data-halo-world='dichroic'] {
  --halo-coat-a: oklch(78% 0.16 150);
  --halo-radius: 12px;
}

/* Or one instance, with a Tailwind arbitrary property */
<Toaster className="[--halo-blur:8px]" />`;

const tailwind = `/* app.css: layered, so utilities beat the material */
@import 'tailwindcss';
@import '@halo-ui/react/styles.css' layer(components);

<Toaster
  classNames={{
    title: 'tracking-tight',
    action: 'bg-emerald-600 text-white',
  }}
/>

toast('Saved', { className: 'ring-2 ring-emerald-500/40' });`;

const tokens: ReadonlyArray<readonly [string, string]> = [
  ['--halo-surface', 'Pane fill. Keep it translucent for glass.'],
  ['--halo-surface-solid', 'Fallback fill for reduced transparency and no backdrop-filter.'],
  ['--halo-fg / --halo-fg-muted', 'Text and secondary text.'],
  ['--halo-blur / --halo-saturate', 'The frost: backdrop blur and saturation.'],
  ['--halo-world-edge', 'The edge ring. Any colour or gradient.'],
  ['--halo-coat-a / -b / -c', 'Dichroic coat colours, used by the default edge.'],
  ['--halo-shadow', 'Depth. Any box-shadow list.'],
  ['--halo-radius', 'Corner radius.'],
  ['--halo-control / --halo-control-fg', 'Action button fill and text.'],
  ['--halo-success / error / warning / info', 'Type colours for icons, timers, and tint.'],
];

const hooks: ReadonlyArray<readonly [string, string]> = [
  ['.halo-toast', 'Each toast. Parts: -body, -icon, -title, -description, -action, -close.'],
  ['[data-type="error"]', 'The toast type: default, success, error, warning, info, loading.'],
  ['[data-front]', 'The toast at the front of the stack.'],
  ['[data-intent="edge"]', 'Toasts showing their type in colour: tint, edge, or glow.'],
  ['[data-hidden]', 'Toasts past the visible count. Inert, and they never block the page.'],
  ['[data-swiping]', 'A toast mid-swipe.'],
  ['.halo-drawer-panel[data-dragging]', 'A drawer mid-drag.'],
];

export function MakeItYours() {
  const { theme } = useSettings();
  return (
    <Section
      id="customize"
      title="Make it yours"
      lede={
        <>
          <p className="m-0">A world is one CSS selector. Write your own, extend a built-in one, or style any part with Tailwind.</p>
          <p className="m-0 mt-4">No config file, no theme provider, and no JavaScript. Halo’s own tokens have zero specificity, so your selector always wins.</p>
        </>
      }
    >
      <Toaster id="custom" world="midnight" theme={theme} position="bottom-left" />

      <h3 className="m-0 text-[24px] font-semibold tracking-[-0.02em]">Write a world</h3>
      <p className="mt-2 mb-5 max-w-[60ch] text-[15px] leading-[1.55] text-ink-soft">
        Midnight lives in this site’s stylesheet. The library has never heard of it.
      </p>
      <div className="mb-5">
        <Button tone="primary" size="sm" onClick={() => toast.success('Midnight, from plain CSS', { toasterId: 'custom', description: 'One selector, nothing in the library' })}>
          Fire a Midnight toast
        </Button>
      </div>
      <CodeBlock label="midnight.css" code={writeWorld} />

      <div className="mt-14 grid gap-10 xl:grid-cols-2">
        <div className="min-w-0">
          <h3 className="m-0 text-[24px] font-semibold tracking-[-0.02em]">Extend one</h3>
          <p className="mt-2 mb-5 text-[15px] leading-[1.55] text-ink-soft">Every value is a custom property, so standard cascade rules apply.</p>
          <CodeBlock label="extend.css" code={extendWorld} />
        </div>
        <div className="min-w-0">
          <h3 className="m-0 text-[24px] font-semibold tracking-[-0.02em]">Style with Tailwind</h3>
          <p className="mt-2 mb-5 text-[15px] leading-[1.55] text-ink-soft">
            <code className="text-[14px]">classNames</code> reaches every part. Per-toast <code className="text-[14px]">className</code> works too.
          </p>
          <CodeBlock label="app.tsx" code={tailwind} />
        </div>
      </div>

      <div className="mt-14 grid gap-10 xl:grid-cols-2">
        {(
          [
            ['Tokens', tokens],
            ['Selectors and states', hooks],
          ] as const
        ).map(([title, rows]) => (
          <div key={title} className="min-w-0">
            <h3 className="m-0 mb-3 text-[20px] font-semibold tracking-[-0.015em]">{title}</h3>
            <dl className="m-0">
              {rows.map(([term, detail]) => (
                <div key={term} className="grid gap-1 border-b border-line py-3 last:border-0 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-4">
                  <dt className="font-mono text-[12.5px] break-words text-ink">{term}</dt>
                  <dd className="m-0 text-[14px] leading-[1.5] text-ink-soft">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Section>
  );
}
