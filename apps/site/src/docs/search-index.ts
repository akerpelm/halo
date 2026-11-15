import { type PropRow, drawerParts, drawerRootProps, selectors, toastFunctions, toastOptions, toasterProps, tokens } from './api';
import { docPages } from './pages';
import { propId } from './prop-table';

export type Entry = { label: string; kind: 'Page' | 'Section' | 'Function' | 'Option' | 'Prop' | 'Part' | 'Token' | 'Selector'; href: string; hint: string };

export function buildIndex(): Entry[] {
  const entries: Entry[] = [
    { label: 'Home', kind: 'Page', href: '/', hint: 'The showcase: the flick test, four extra toast types, and the worlds.' },
    { label: 'Playground', kind: 'Page', href: '/playground', hint: 'Start from a plain toast and layer it up. Take the code or an agent prompt.' },
  ];
  for (const page of docPages) {
    entries.push({ label: page.title, kind: 'Page', href: `/docs/${page.slug}`, hint: page.lede });
    for (const s of page.sections) entries.push({ label: s.title, kind: 'Section', href: `/docs/${page.slug}#${s.id}`, hint: page.title });
  }
  const rows = (list: readonly PropRow[], kind: Entry['kind'], slug: string, where: string) => {
    for (const r of list) entries.push({ label: r.name, kind, href: `/docs/${slug}#${propId(r.name)}`, hint: `${where} · ${r.description}` });
  };
  rows(toastFunctions, 'Function', 'toast', 'Toast');
  rows(toastOptions, 'Option', 'toast', 'Toast option');
  rows(toasterProps, 'Prop', 'toast', 'Toaster');
  rows(drawerRootProps, 'Prop', 'drawer', 'Drawer.Root');
  rows(drawerParts, 'Part', 'drawer', 'Drawer');
  rows(tokens, 'Token', 'customize', 'Customize');
  rows(selectors, 'Selector', 'customize', 'Customize');
  return entries;
}
