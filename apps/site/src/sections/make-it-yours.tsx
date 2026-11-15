import { Toaster, toast } from '@halo-ui/react/toast';
import { Button } from '../components/button';
import { Link } from '../components/link';
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
      <Toaster id="custom" label="Midnight demo notifications" world="midnight" theme={theme} position="bottom-left" />

      <h3 className="m-0 text-heading font-semibold tracking-[-0.02em]">Write a world</h3>
      <p className="mt-2 mb-5 max-w-[60ch] text-body leading-[1.55] text-ink-soft">
        Midnight lives in this site’s stylesheet. The library has never heard of it.
      </p>
      <div className="mb-5">
        <Button tone="primary" size="sm" onClick={() => toast.success('Midnight, from plain CSS', { toasterId: 'custom', description: 'One selector, nothing in the library' })}>
          Fire a Midnight toast
        </Button>
      </div>
      <CodeBlock label="midnight.css" code={writeWorld} />

      <p className="mt-10 mb-0 max-w-[60ch] text-body leading-[1.6] text-ink-soft">
        Extend a built-in world with the same selector, style any toast part with Tailwind through <code className="text-ui">classNames</code>, and
        find every token and state selector in the{' '}
        <Link href="/docs/customize" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          Customize docs
        </Link>
        .
      </p>
    </Section>
  );
}
