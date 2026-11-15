import { CodeBlock } from '../components/code-block';
import { Section } from '../components/section';

const oneLiner = () => `Read ${window.location.origin}/llms.txt, then replace this app's notifications with Halo toasts. Keep every existing message and its meaning.`;

const files = [
  ['/llms.txt', 'The whole API in one plain-text file: install, every prop, every rule. Small enough to fit in any context window.'],
  ['Copy prompt', 'Each direction and every playground state turns into a prompt with exact code and the rules that keep it accessible.'],
  ['Stable surface', 'Props are plain values and the styling is CSS custom properties, so an agent never has to work out class names or override motion.'],
] as const;

export function Agents() {
  return (
    <Section
      id="agents"
      title="For agents"
      lede={
        <p className="m-0">
          Most components now arrive through an AI agent. Halo is written so the agent gets it right the first time: one obvious way to do each
          thing, documented in a form a model reads well.
        </p>
      }
    >
      <dl className="m-0 grid gap-8 sm:grid-cols-3">
        {files.map(([term, detail]) => (
          <div key={term}>
            <dt className="font-display text-[19px] font-semibold tracking-[-0.015em]">{term}</dt>
            <dd className="m-0 mt-2 text-[15px] leading-[1.55] text-ink-soft">{detail}</dd>
          </div>
        ))}
      </dl>
      <CodeBlock className="mt-12" label="Paste into your agent" code={oneLiner()} copyLabel="Copy prompt" wrap />
      <p className="mt-4 mb-0 text-[14px] text-ink-faint">
        <a href="/llms.txt" className="text-ink-soft hover:text-ink">
          Open llms.txt
        </a>
      </p>
    </Section>
  );
}
