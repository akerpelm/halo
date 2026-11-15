import type { ToastRecord } from '../store/toast-store';

type Options = {
  live: readonly ToastRecord[];
  heights: Record<string, number>;
  gap: number;
  peek: number;
  expanded: boolean;
  visibleToasts: number;
};

export function stackLayout({ live, heights, gap, peek, expanded, visibleToasts }: Options) {
  const heightOf = (toast: ToastRecord | undefined) => (toast ? (heights[String(toast.id)] ?? 0) : 0);
  const offsets: number[] = [];
  live.forEach((toast, i) => {
    offsets.push(i === 0 ? 0 : (offsets[i - 1] ?? 0) + heightOf(live[i - 1]) + gap);
  });
  const frontHeight = heightOf(live[0]);
  const visibleCount = Math.min(live.length, visibleToasts);
  const stackHeight = expanded
    ? (offsets[visibleCount - 1] ?? 0) + heightOf(live[visibleCount - 1])
    : frontHeight + Math.max(visibleCount - 1, 0) * peek;
  return { offsets, frontHeight, stackHeight };
}
