import { cn } from '../lib/cn';
import { CopyButton } from './copy-button';

type CodeBlockProps = { code: string; label?: string; className?: string; copyLabel?: string; wrap?: boolean };

export function CodeBlock({ code, label, className, copyLabel, wrap = false }: CodeBlockProps) {
  return (
    <figure className={cn('min-w-0 overflow-hidden rounded-2xl bg-wall-deep/70 shadow-[inset_0_0_0_1px_var(--line)]', className)}>
      <figcaption className="flex items-center justify-between gap-3 py-1.5 pr-1.5 pl-4">
        <span className="truncate font-mono text-[12px] text-ink-faint">{label}</span>
        <CopyButton text={code} label={copyLabel} />
      </figcaption>
      <pre className={cn('overflow-x-auto px-4 pt-1 pb-4 text-[13px] leading-[1.7] text-ink', wrap && 'break-words whitespace-pre-wrap')}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
