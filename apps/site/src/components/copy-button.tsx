import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

type CopyButtonProps = { text: string; label?: string; className?: string };

export function CopyButton({ text, label = 'Copy', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 pointer-coarse:h-11 text-caption font-medium text-ink-soft transition-colors duration-150 hover:bg-ink/[0.07] hover:text-ink',
        className,
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
        {copied ? (
          <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 3.5v-.25A1.75 1.75 0 0 0 8.75 1.5h-5.5A1.75 1.75 0 0 0 1.5 3.25v5.5c0 .97.78 1.75 1.75 1.75h.25" stroke="currentColor" strokeWidth="1.3" />
          </>
        )}
      </svg>
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}
