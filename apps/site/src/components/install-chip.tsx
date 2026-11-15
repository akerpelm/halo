import { CopyButton } from './copy-button';

export function InstallChip() {
  return (
    <div className="inline-flex h-12 items-center gap-2 rounded-full pr-1.5 pl-5 shadow-[inset_0_0_0_1px_var(--line)]">
      <code className="text-ui text-ink">
        <span className="text-ink-faint select-none">$ </span>npm i halo-ui-react
      </code>
      <CopyButton text="npm i halo-ui-react" />
    </div>
  );
}
