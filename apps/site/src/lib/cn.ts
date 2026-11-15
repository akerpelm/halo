import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge must know our @theme tokens, or it reads `text-label` (a size) as a colour
// and silently drops a real colour class like `text-wall` as a "conflict".
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['caption', 'label', 'ui', 'body', 'lead', 'title', 'heading'],
      ease: ['spring'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
