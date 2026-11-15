import { Mark } from '../components/nav';

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-4 py-10 text-[14px] text-ink-faint sm:px-8">
        <p className="m-0 flex items-center gap-2">
          <Mark className="h-4 w-6" />
          <span>Halo 0.1.0. Every animation on this page runs on its own springs.</span>
        </p>
        <a href="#top" className="text-ink-soft hover:text-ink">
          Back to top
        </a>
      </div>
    </footer>
  );
}
