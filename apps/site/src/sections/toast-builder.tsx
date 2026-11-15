import { type ToastPosition, resolveSpring, sampleSpring } from 'halo-ui-react';
import { Toaster, toast } from 'halo-ui-react/toast';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '../components/button';
import { CodeBlock } from '../components/code-block';
import { Segmented } from '../components/segmented';
import { Select } from '../components/select';
import { Slider } from '../components/slider';
import { SpringCurve } from '../components/spring-curve';
import { SpringPreview } from '../components/spring-preview';
import { Toggle } from '../components/toggle';
import {
  type BuildConfig,
  type CoatName,
  MAXED,
  PLAIN,
  builderCode,
  builderPrompt,
  coats,
  layers,
  motions,
  springChoices,
  toToasterProps,
} from '../lib/build';
import { cn } from '../lib/cn';
import { LLMS_URL } from '../lib/site';
import { PRINCIPLES } from '../lib/config';
import { playgroundDemos } from '../lib/demo-toasts';
import { useSettings } from '../lib/settings';
import { customWorlds, worldName, worlds } from '../lib/worlds';

type ToastBuilderProps = {
  config: BuildConfig;
  onChange: (config: BuildConfig) => void;
  output: 'code' | 'prompt';
  onOutput: (output: 'code' | 'prompt') => void;
};

const positions: ReadonlyArray<{ value: ToastPosition; label: string }> = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-center', label: 'Top' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-center', label: 'Bottom' },
  { value: 'bottom-right', label: 'Bottom right' },
];

const tile =
  'relative grid cursor-pointer content-start gap-1 rounded-2xl p-3 text-left transition-[background-color,box-shadow] duration-150 shadow-[inset_0_0_0_1px_var(--line)] hover:bg-ink/[0.04] aria-pressed:bg-ink/[0.05] aria-pressed:shadow-[inset_0_0_0_1.5px_var(--ink)]';

function Group({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="m-0 grid min-w-0 gap-3 border-0 border-t border-line p-0 pt-5 first:border-t-0 first:pt-0">
      <legend className="float-left mb-1 w-full p-0 font-display text-body font-semibold tracking-[-0.01em] text-ink">{title}</legend>
      {note && <p className="m-0 -mt-1 text-label leading-snug text-ink-faint">{note}</p>}
      {children}
    </fieldset>
  );
}

function Fold({ title, current, children }: { title: string; current: string; children: ReactNode }) {
  return (
    <details className="group border-t border-line pt-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 select-none [&::-webkit-details-marker]:hidden">
        <span className="font-display text-body font-semibold tracking-[-0.01em] text-ink">{title}</span>
        <span className="flex items-center gap-2 text-label text-ink-faint">
          {current}
          <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className="transition-transform duration-200 group-open:rotate-180">
            <path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="grid gap-4 pt-3 pb-1">{children}</div>
    </details>
  );
}

function Shortlist<T>({
  items,
  isSelected,
  render,
  className,
  limit = 4,
}: {
  items: readonly T[];
  isSelected: (item: T) => boolean;
  render: (item: T) => ReactNode;
  className: string;
  limit?: number;
}) {
  const [open, setOpen] = useState(false);
  const extra = items.length - limit;
  const selectedLate = items.findIndex(isSelected) >= limit;
  const shown = open ? items : items.filter((item, index) => index < (selectedLate ? limit - 1 : limit) || isSelected(item));
  return (
    <>
      <div className={className}>{shown.map(render)}</div>
      {extra > 0 && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-6 cursor-pointer items-center justify-self-start text-label text-ink-soft underline decoration-line underline-offset-4 hover:text-ink pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:px-1"
        >
          {open ? 'Fewer' : `${extra} more`}
        </button>
      )}
    </>
  );
}

const featured = <T extends { value: string }>(list: readonly T[], first: readonly string[]) =>
  [...first.map((v) => list.find((x) => x.value === v)).filter((x): x is T => Boolean(x)), ...list.filter((x) => !first.includes(x.value))];

function MiniCurve({ preset }: { preset: Parameters<typeof resolveSpring>[0] }) {
  const samples = sampleSpring(resolveSpring(preset), 28, 2);
  const peak = Math.max(...samples, 1);
  const d = samples.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / 27) * 56).toFixed(1)},${(20 - (v / peak) * 16).toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 56 22" className="h-5 w-full" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function CoatSwatch({ colors }: { colors: readonly string[] }) {
  return (
    <span aria-hidden className="flex -space-x-1.5">
      {colors.map((c) => (
        <span key={c} className="size-4 rounded-full ring-2 ring-wall" style={{ background: c }} />
      ))}
    </span>
  );
}

export function ToastBuilder({ config, onChange, output, onOutput }: ToastBuilderProps) {
  const { theme } = useSettings();
  const set = (patch: Partial<BuildConfig>) => onChange({ ...config, ...patch });
  const added = layers(config, worldName);
  const previousConfig = useRef(config);
  const lastPreview = useRef<string | number | null>(null);

  useEffect(() => {
    const previous = previousConfig.current;
    if (previous === config) return;
    previousConfig.current = config;

    const replay = previous.motion !== config.motion || JSON.stringify(previous.spring) !== JSON.stringify(config.spring);
    const showing = lastPreview.current !== null && toast.isActive(lastPreview.current);
    if (showing && !replay && lastPreview.current !== null) {
      playgroundDemos.refresh(lastPreview.current);
      return;
    }
    let fire = 0;
    const timer = window.setTimeout(() => {
      const previous = lastPreview.current;
      if (previous === null) {
        lastPreview.current = playgroundDemos.success();
        return;
      }
      toast.dismiss(previous);
      fire = window.setTimeout(() => {
        lastPreview.current = playgroundDemos.success();
      }, 320);
    }, 260);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(fire);
    };
  }, [config]);

  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        if (lastPreview.current === null) lastPreview.current = playgroundDemos.success();
      },
      { threshold: 0.6 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const surprise = () => {
    const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)] as T;
    onChange({
      ...config,
      world: pick([...worlds, ...customWorlds]).value,
      motion: pick(motions).value,
      spring: pick(springChoices).value,
      coat: pick(['material', 'aurora', 'ember', 'lagoon', 'orchid', 'mono'] as const),
      intent: pick(['tint', 'edge', 'glow', false] as const),
      icons: true,
      timer: pick(['icon', 'close', 'edge', false] as const),
      closeButton: Math.random() > 0.3,
      radius: pick(['square', 'soft', 'round', 'pill'] as const),
    });
  };

  const customSpring = typeof config.spring === 'string' ? null : config.spring;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-5" aria-live="polite">
        <p className="m-0 mr-2 text-ui text-ink">
          {added.length === 0 ? (
            <span>A plain toast. Add a layer below.</span>
          ) : (
            <span>
              <span className="font-semibold tabular-nums">{added.length}</span> {added.length === 1 ? 'layer' : 'layers'} on a plain toast
            </span>
          )}
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {added.map((layer) => (
            <li key={layer.key}>
              <button
                type="button"
                onClick={() => set({ [layer.key]: PLAIN[layer.key] } as Partial<BuildConfig>)}
                className="inline-flex h-7 pointer-coarse:h-11 cursor-pointer items-center gap-1.5 rounded-full bg-ink/[0.07] pr-2 pl-3 text-label text-ink transition-colors duration-150 hover:bg-ink/[0.12]"
                aria-label={`Remove ${layer.label}`}
              >
                {layer.label}
                <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden className="text-ink-faint">
                  <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex gap-1.5">
          <Button size="sm" tone="outline" onClick={() => onChange(PLAIN)} disabled={added.length === 0}>
            Back to plain
          </Button>
          <Button size="sm" onClick={surprise}>
            Surprise me
          </Button>
          <Button size="sm" tone="primary" onClick={() => onChange(MAXED)}>
            Max it out
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <form className="grid content-start gap-6 border-line p-5 max-lg:border-b lg:border-r" onSubmit={(event) => event.preventDefault()} aria-label="Toast layers">
          <Group title="World">
            <Shortlist
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              items={featured([...worlds, ...customWorlds], ['dichroic', 'partition', 'ink', 'smoked'])}
              isSelected={(w) => config.world === w.value}
              render={(w) => (
                <button key={w.value} type="button" aria-pressed={config.world === w.value} onClick={() => set({ world: w.value })} className={tile}>
                  <span data-world={w.value} className="grid h-12 place-items-center rounded-xl bg-wall-deep">
                    <span data-halo-world={w.value} data-theme={theme} className="halo halo-surface block h-6 w-[70%] [--halo-radius:8px]" />
                  </span>
                  <span className="grid text-label leading-tight font-medium text-ink">
                    {w.name}
                    {customWorlds.some((c) => c.value === w.value) && <span className="text-caption font-normal whitespace-nowrap text-ink-faint">Example: your CSS</span>}
                  </span>
                </button>
              )}
            />
          </Group>

          <Group title="Entrance and exit">
            <Shortlist
              className="grid grid-cols-2 gap-2"
              items={featured(motions, ['fade', 'rise', 'bloom', 'hinge'])}
              isSelected={(m) => config.motion === m.value}
              render={(m) => (
                <button key={m.value} type="button" aria-pressed={config.motion === m.value} onClick={() => set({ motion: m.value })} className={tile}>
                  <span className="text-label font-medium text-ink">{m.name}</span>
                  <span className="text-caption leading-snug text-ink-faint">{m.line}</span>
                </button>
              )}
            />
          </Group>

          <Group title="Spring" note="Drives every move: entering, stacking, and springing back after a swipe. Each pick plays on the track.">
            <SpringPreview spring={config.spring} />
            <Shortlist
              className="grid grid-cols-4 gap-2"
              items={featured(springChoices, ['smooth', 'snappy', 'bouncy', 'jelly'])}
              isSelected={(s) => config.spring === s.value}
              render={(s) => (
                <button key={s.value} type="button" aria-pressed={config.spring === s.value} onClick={() => set({ spring: s.value })} className={cn(tile, 'p-2.5 text-ink')}>
                  <MiniCurve preset={s.value} />
                  <span className="text-label font-medium">{s.name}</span>
                </button>
              )}
            />
            <details className="group" open={customSpring !== null}>
              <summary className="flex min-h-6 cursor-pointer items-center text-label text-ink-soft select-none hover:text-ink pointer-coarse:min-h-11">Custom spring</summary>
              <div className="mt-3 grid gap-4">
                <SpringCurve spring={customSpring ?? resolveSpring(config.spring)} />
                <Slider
                  label="Duration"
                  value={customSpring?.duration ?? 0.45}
                  min={0.15}
                  max={1.2}
                  step={0.01}
                  format={(v) => `${v.toFixed(2)} s`}
                  onChange={(duration) => set({ spring: { duration, bounce: customSpring?.bounce ?? 0.1 } })}
                />
                <Slider
                  label="Bounce"
                  value={customSpring?.bounce ?? 0.1}
                  min={0}
                  max={0.6}
                  step={0.01}
                  format={(v) => v.toFixed(2)}
                  onChange={(bounce) => set({ spring: { duration: customSpring?.duration ?? 0.45, bounce } })}
                />
              </div>
            </details>
          </Group>

          <Group title="Colour" note="Coat colours paint the Dichroic edge, so picking one switches the world to Dichroic.">
            <Shortlist
              className="grid grid-cols-2 gap-2"
              items={['material', ...Object.keys(coats)] as CoatName[]}
              isSelected={(name) => config.coat === name}
              render={(name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={config.coat === name}
                  onClick={() => set(name === 'material' ? { coat: name } : { coat: name, world: 'dichroic' })} className={cn(tile, 'grid-flow-col items-center justify-start gap-2.5')}>
                  {name === 'material' ? (
                    <span aria-hidden className="size-4 rounded-full shadow-[inset_0_0_0_1.5px_var(--ink-faint)]" />
                  ) : (
                    <CoatSwatch colors={coats[name as Exclude<CoatName, 'material'>].colors} />
                  )}
                  <span className="text-label font-medium text-ink">{name === 'material' ? 'World’s own' : coats[name as Exclude<CoatName, 'material'>].name}</span>
                </button>
              )}
            />
            <Segmented
              label="Intent: show the type in colour"
              value={config.intent || 'off'}
              onChange={(value) => set({ intent: value === 'off' ? false : value })}
              options={[
                { value: 'off', label: 'Off' },
                { value: 'tint', label: 'Tint' },
                { value: 'edge', label: 'Edge' },
                { value: 'glow', label: 'Glow' },
              ]}
            />
          </Group>

          <Fold title="Shape" current={`${config.radius[0]?.toUpperCase()}${config.radius.slice(1)} · ${config.density === 'comfortable' ? 'Regular' : `${config.density[0]?.toUpperCase()}${config.density.slice(1)}`}`}>
            <Segmented
              label="Corners"
              value={config.radius}
              onChange={(radius) => set({ radius })}
              options={[
                { value: 'square', label: 'Square' },
                { value: 'soft', label: 'Soft' },
                { value: 'round', label: 'Round' },
                { value: 'pill', label: 'Pill' },
              ]}
            />
            <Segmented
              label="Density"
              value={config.density}
              onChange={(density) => set({ density })}
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'comfortable', label: 'Regular' },
                { value: 'spacious', label: 'Spacious' },
              ]}
            />
          </Fold>

          <Fold
            title="Details"
            current={[config.icons && 'Icons', config.closeButton && 'Close', config.timer && `${config.timer} timer`].filter(Boolean).join(' · ') || 'None'}
          >
            <div className="grid gap-3">
              <Toggle label="Type icons" checked={config.icons} onChange={(icons) => set({ icons })} />
              <Toggle label="Close button" checked={config.closeButton} onChange={(closeButton) => set({ closeButton })} />
            </div>
            <Segmented
              label="Time left"
              value={config.timer || 'off'}
              onChange={(value) => set({ timer: value === 'off' ? false : value })}
              options={[
                { value: 'off', label: 'Off' },
                { value: 'icon', label: 'Icon' },
                { value: 'close', label: 'Close' },
                { value: 'edge', label: 'Edge' },
              ]}
            />
          </Fold>

          <Fold title="Stack" current={positions.find((p) => p.value === config.position)?.label ?? ''}>
            <Select label="Position" value={config.position} onChange={(event) => set({ position: event.target.value as ToastPosition })}>
              {positions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Slider
              label="Auto-dismiss"
              value={config.duration}
              min={2000}
              max={10000}
              step={500}
              format={(v) => `${(v / 1000).toFixed(1)} s`}
              onChange={(duration) => set({ duration })}
            />
            <Toggle label="Always fanned out" checked={config.expand} onChange={(expand) => set({ expand })} />
          </Fold>
        </form>

        <div className="min-w-0 max-lg:contents lg:flex lg:flex-col lg:gap-5 lg:p-5">
          <div ref={stageRef} data-world={config.world} className="sticky top-16 z-10 h-[300px] overflow-hidden rounded-2xl bg-wall-deep max-lg:order-first max-lg:m-3 max-lg:h-[168px] lg:top-[76px] lg:shadow-[0_0_0_12px_var(--wall)]" aria-label="Preview stage" role="region">
            <span aria-hidden className="cast absolute inset-x-[10%] bottom-[-30%] h-[70%]">
              <span className="pool top-0 left-0 h-full w-[55%] bg-coat-a" />
              <span className="pool top-[10%] right-0 h-full w-[50%] bg-coat-b" />
            </span>
            <Toaster id="playground" contained offset={16} label="Playground notifications" theme={theme} {...toToasterProps(config)} />
          </div>
          <div className="grid gap-5 max-lg:p-5">
          <div>
            <p className="m-0 mb-3 text-label text-ink-soft">Every change fires a preview. Or fire your own:</p>
            <div className="flex flex-wrap gap-2">
              <Button tone="primary" size="sm" onClick={() => playgroundDemos.success()}>
                Success
              </Button>
              <Button size="sm" onClick={() => playgroundDemos.error()}>
                Error
              </Button>
              <Button size="sm" onClick={() => playgroundDemos.promise()}>
                Promise
              </Button>
              <Button
                size="sm"
                onClick={() => [playgroundDemos.default, playgroundDemos.info, playgroundDemos.warning, playgroundDemos.success].forEach((fire, i) => window.setTimeout(fire, i * 140))}
              >
                Burst of four
              </Button>

            </div>
          </div>
          <Segmented
            label="Output"
            hideLabel
            value={output}
            onChange={onOutput}
            options={[
              { value: 'code', label: 'Code' },
              { value: 'prompt', label: 'Agent prompt' },
            ]}
          />
          <CodeBlock
            className="-mx-5 -mb-5 rounded-none bg-transparent shadow-[inset_0_1px_0_var(--line)]"
            code={output === 'code' ? builderCode(config) : builderPrompt(config, PRINCIPLES, LLMS_URL)}
            label={output === 'code' ? 'toaster.tsx' : 'prompt.md'}
            copyLabel={output === 'code' ? 'Copy code' : 'Copy prompt'}
            wrap={output === 'prompt'}
          />
          </div>
        </div>
      </div>
    </>
  );
}
