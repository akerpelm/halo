import { InstallChip } from '../components/install-chip';
import { Link } from '../components/link';
import { Mark } from '../components/nav';
import { version } from '../lib/package-facts';
import { GITHUB_URL, NPM_URL } from '../lib/site';
import { docsRoutes } from '../routes';

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
      <nav aria-label="Site map" className="mx-auto grid max-w-[1240px] gap-8 border-t border-line px-4 py-10 text-ui sm:grid-cols-3 sm:px-8">
        <div>
          <p className="m-0 mb-3 flex items-center gap-2 text-ink">
            <Mark className="mt-1 h-[9px] w-6" />
            <span className="font-medium">Halo {version}</span>
          </p>
          <p className="m-0 text-ink-faint">Spring-physics toast, drawer, popover and swipe actions for React.</p>
        </div>
        <ul className="m-0 grid list-none gap-1.5 p-0">
          {docsRoutes.map((p) => (
            <li key={p.slug}>
              <Link href={p.path} className="inline-flex min-h-6 items-center text-ink-soft no-underline hover:text-ink pointer-coarse:min-h-11">
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="m-0 grid list-none content-start gap-1.5 p-0">
          {(
            [
              ['Home', '/'],
              ['Playground', '/playground'],
              ['llms.txt', '/llms.txt'],
              ['GitHub', GITHUB_URL],
              ['npm', NPM_URL],
            ] as const
          ).map(([label, href]) => (
            <li key={href}>
              <Link href={href} className="inline-flex min-h-6 items-center text-ink-soft no-underline hover:text-ink pointer-coarse:min-h-11">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
