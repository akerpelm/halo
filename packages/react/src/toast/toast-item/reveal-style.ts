import { clamp } from '../../gesture/projection';
import type { StackEdge } from '../toaster/toaster-context';
import type { ToastMotion } from '../types';

export type Reveal = { transform: string; opacity: number; filter: string; clip: string };

const SHADOW_BLEED = 64;
const SETTLED = 0.002;

export const unit = (n: number) => clamp(n, 0, 1);

const reveal = (transform: string, opacity: number, extra: Partial<Reveal> = {}): Reveal => ({ transform, opacity, filter: '', clip: '', ...extra });

function bloomClip(remaining: number) {
  const side = unit(remaining);
  const bleed = SHADOW_BLEED * (1 - side);
  return `inset(-${SHADOW_BLEED}px calc(${(side * 42).toFixed(2)}% - ${bleed.toFixed(1)}px) round var(--halo-radius))`;
}

export function revealStyle(motion: ToastMotion, progress: number, edge: StackEdge): Reveal {
  const remaining = 1 - progress;
  switch (motion) {
    case 'fade':
      return reveal('', unit(progress));
    case 'drop':
      return reveal(`translate3d(0, ${-edge * remaining * 72}px, 0)`, unit(progress * 2.5));
    case 'hinge':
      return reveal(`perspective(700px) rotateX(${remaining * -78}deg)`, unit(progress * 1.6));
    case 'focus':
      return reveal(`scale(${1 + remaining * 0.07})`, unit(progress), {
        filter: remaining > SETTLED ? `blur(${(unit(remaining) * 12).toFixed(2)}px)` : '',
      });
    case 'bloom':
      return reveal('', unit(progress * 3), { clip: remaining > SETTLED ? bloomClip(remaining) : '' });
    default:
      return reveal(`translate3d(0, ${edge * remaining * 28}px, 0) scale(${0.96 + 0.04 * progress})`, unit(progress));
  }
}
