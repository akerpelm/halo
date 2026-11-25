import { test } from '@playwright/test';
import { homeRoute, routes } from '../src/routes';

const out = new URL('../public/og/', import.meta.url).pathname;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function card(title: string, eyebrow: string) {
  const pool = (x: number, y: number, w: number, h: number, color: string) =>
    `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:var(${color});filter:blur(70px);opacity:0.55"></div>`;
  return `
  <div style="position:fixed;inset:0;overflow:hidden;background:var(--wall);font-family:var(--font-sans)">
    <div aria-hidden style="position:absolute;left:-40px;bottom:-150px;font-family:var(--font-display);font-weight:600;font-size:520px;letter-spacing:-0.06em;color:var(--ink);opacity:0.07;line-height:1">halo</div>
    ${pool(560, 300, 420, 260, '--coat-a')}${pool(860, 240, 360, 280, '--coat-b')}${pool(700, 430, 380, 220, '--coat-c')}
    <div style="position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:14px;color:var(--ink)">
      <svg viewBox="0 0 28 10" width="56" height="20"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0.35"><stop offset="0" stop-color="oklch(80% 0.14 198)"/><stop offset="0.55" stop-color="oklch(69% 0.22 332)"/><stop offset="1" stop-color="oklch(85% 0.14 78)"/></linearGradient></defs><path d="M1 1A13 8 0 0 0 27 1A13 3.6 0 0 1 1 1Z" fill="url(#g)"/></svg>
      <span style="font-family:var(--font-display);font-weight:600;font-size:38px;letter-spacing:-0.02em">halo</span>
    </div>
    <div data-halo-world="dichroic" data-theme="light" class="halo halo-surface" style="position:absolute;left:72px;right:72px;top:168px;bottom:120px;--halo-radius:32px;padding:56px 60px;display:flex;flex-direction:column;justify-content:center">
      <p style="margin:0 0 18px;font-family:var(--font-mono);font-size:22px;color:var(--ink-faint)">${escape(eyebrow)}</p>
      <p style="margin:0;max-width:20ch;font-family:var(--font-display);font-weight:600;font-size:68px;line-height:1.02;letter-spacing:-0.035em;color:var(--ink);text-wrap:balance">${escape(title)}</p>
    </div>
    <div style="position:absolute;left:72px;right:72px;bottom:52px;display:flex;justify-content:space-between;font-size:24px;color:var(--ink-soft)">
      <span>Spring-physics components for React</span>
      <span style="font-family:var(--font-mono)">haloui.dev</span>
    </div>
  </div>`;
}

test.use({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });

for (const route of routes) {
  test(`og image for ${route.path}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('halo-site', JSON.stringify({ world: 'dichroic', theme: 'light' })));
    await page.goto('/404.html');
    const title = route === homeRoute ? 'Components that keep the speed of your flick.' : route.ogAlt;
    const eyebrow = route.path.startsWith('/docs') ? `haloui.dev${route.path}` : 'npm i halo-ui-react';
    await page.evaluate((html) => {
      document.body.innerHTML = html;
    }, card(title, eyebrow));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${out}${route.ogImage.split('/').pop()}` });
  });
}
