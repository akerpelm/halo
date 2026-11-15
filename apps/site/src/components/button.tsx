import { type VariantProps, cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export const buttonClass = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none pointer-coarse:min-h-11 transition-[background-color,color,opacity,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 cursor-pointer',
  {
    variants: {
      tone: {
        primary: 'bg-ink text-wall hover:opacity-88',
        quiet: 'bg-ink/[0.06] text-ink hover:bg-ink/[0.11] dark:bg-ink/[0.09] dark:hover:bg-ink/[0.15]',
        outline: 'text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:bg-ink/[0.05]',
      },
      size: {
        sm: 'h-8 px-3.5 text-label',
        md: 'h-10 px-4.5 text-ui',
        lg: 'h-12 px-6 text-body',
      },
    },
    defaultVariants: { tone: 'quiet', size: 'md' },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonClass>;

export function Button({ className, tone, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClass({ tone, size }), className)} {...props} />;
}
