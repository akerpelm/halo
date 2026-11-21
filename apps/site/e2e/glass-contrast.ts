export type ContrastFailure = { text: string; ratio: number; need: number; className: string };

/**
 * axe cannot see through translucent, blurred glass, so it skips text on Halo panes. This measures every text node
 * inside a `.halo-surface` against both the world's solid surface and its glass laid over the page, and keeps the
 * worse of the two. The pane's own opacity is left out: it is entrance and exit motion, not a colour.
 */
export function glassContrastFailures(): ContrastFailure[] {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return [];
  type Rgba = [number, number, number, number];
  type Rgb = [number, number, number];
  const rgba = (css: string): Rgba => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000';
    context.fillStyle = css;
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 0] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const luminance = ([r, g, b]: Rgb) => {
    const channel = (c: number) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const over = ([r, g, b, a]: Rgba, [R, G, B]: Rgb): Rgb => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
  const ratio = (x: Rgb, y: Rgb) => {
    const [high, low] = [luminance(x), luminance(y)].sort((p, q) => q - p);
    return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
  };
  const resolve = (pane: Element, value: string) => {
    const probe = document.createElement('span');
    probe.style.cssText = `position:absolute;width:0;height:0;background-color:${value}`;
    pane.append(probe);
    const color = rgba(getComputedStyle(probe).backgroundColor);
    probe.remove();
    return color;
  };

  const page = rgba(getComputedStyle(document.body).backgroundColor);
  const failures: ContrastFailure[] = [];
  for (const pane of document.querySelectorAll('.halo-surface')) {
    if (pane.getBoundingClientRect().width === 0 || getComputedStyle(pane).visibility === 'hidden') continue;
    const [sr, sg, sb] = resolve(pane, 'var(--halo-surface-solid)');
    const backgrounds: Rgb[] = [[sr, sg, sb], over(resolve(pane, 'var(--halo-surface)'), [page[0], page[1], page[2]])];
    const walker = document.createTreeWalker(pane, NodeFilter.SHOW_TEXT);
    const checked = new Set<Element>();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const element = node.parentElement;
      if (!element || checked.has(element) || !node.textContent?.trim()) continue;
      checked.add(element);
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || element.closest('[aria-hidden="true"], .sr-only, .halo-sr-only')) continue;
      let opacity = 1;
      const fills: Rgba[] = [];
      for (let up: Element | null = element; up && up !== pane; up = up.parentElement) {
        opacity *= Number(getComputedStyle(up).opacity);
        const fill = rgba(getComputedStyle(up).backgroundColor);
        if (fill[3] > 0) fills.unshift(fill);
      }
      const [r, g, b, a] = rgba(style.color);
      const size = Number.parseFloat(style.fontSize);
      const need = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700) ? 3 : 4.5;
      const worst = Math.min(
        ...backgrounds.map((background) => {
          const under = fills.reduce<Rgb>((below, fill) => over(fill, below), background);
          return ratio(over([r, g, b, a * opacity], under), under);
        }),
      );
      if (worst < need) failures.push({ text: node.textContent.trim().slice(0, 40), ratio: Math.round(worst * 100) / 100, need, className: String(element.className).slice(0, 60) });
    }
  }
  return failures;
}
