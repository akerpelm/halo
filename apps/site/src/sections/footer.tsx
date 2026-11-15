import { InstallChip } from '../components/install-chip';
import { Mark } from '../components/nav';

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1240px] px-4 pt-24 pb-20 sm:px-8">
        <p className="m-0 max-w-[18ch] font-display text-[clamp(2.25rem,5.4vw,4.25rem)] leading-[1] font-semibold tracking-[-0.03em] text-ink">
          Every animation on this page runs on its own springs.
        </p>
        <div className="mt-10">
          <InstallChip />
        </div>
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-8 text-ui text-ink-faint sm:px-8">
        <p className="m-0 flex items-center gap-2">
          <Mark className="h-4 w-6" />
          <span>Halo 0.1.0</span>
        </p>
        <a href="#top" className="inline-flex min-h-6 items-center text-ink-soft hover:text-ink pointer-coarse:min-h-11">
          Back to top
        </a>
      </div>
    </footer>
  );
}
