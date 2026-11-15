import { toast } from '@halo-ui/react/toast';
import type { ReactNode } from 'react';
import { Button } from '../components/button';
import { CodeBlock } from '../components/code-block';
import { CompareTable } from '../components/compare-table';
import { DemoDrawer } from '../components/demo-drawer';
import { MaterialSample } from '../components/material-sample';
import { SpringCurve } from '../components/spring-curve';
import { coats, motions, springChoices } from '../lib/build';
import { demos, newDemos } from '../lib/demo-toasts';
import { defaultDrawerConfig } from '../lib/config';
import { LLMS_URL } from '../lib/site';
import { worlds } from '../lib/worlds';
import { releaseSteps, vsSonner, vsVaul } from './comparisons';
import { drawerParts, drawerRootProps, selectors, toastFunctions, toastOptions, toasterGroups, tokens } from './api';
import { Plaque } from './plaque';
import { PropTable } from './prop-table';
import { C, H2, H3, List, Note, P } from './prose';

export type DocPage = {
  slug: string;
  title: string;
  lede: string;
  sections: ReadonlyArray<{ id: string; title: string }>;
  body: () => ReactNode;
};

function Try({ children }: { children: ReactNode }) {
  return <div className="my-4 flex flex-wrap gap-2">{children}</div>;
}

const gettingStarted: DocPage = {
  slug: 'getting-started',
  title: 'Getting started',
  lede: 'Install Halo, add one Toaster, and call toast() from anywhere. The drawer is a set of parts you compose.',
  sections: [
    { id: 'install', title: 'Install' },
    { id: 'styles', title: 'Add the styles' },
    { id: 'first-toast', title: 'Your first toast' },
    { id: 'first-drawer', title: 'Your first drawer' },
    { id: 'requirements', title: 'Requirements' },
  ],
  body: () => (
    <>
      <H2 id="install">Install</H2>
      <CodeBlock label="terminal" code="npm i @halo-ui/react" />
      <H2 id="styles">Add the styles</H2>
      <P>Import the stylesheet once, in your root layout or entry file.</P>
      <CodeBlock label="main.tsx" code={`import '@halo-ui/react/styles.css';`} />
      <Note title="Using Tailwind?">
        Import it into a cascade layer so your utilities win over the material: <C>@import '@halo-ui/react/styles.css' layer(components);</C>
      </Note>
      <H2 id="first-toast">Your first toast</H2>
      <P>
        Render <C>{'<Toaster />'}</C> once near the root, then call <C>toast()</C> from anywhere, including outside React.
      </P>
      <CodeBlock
        label="app.tsx"
        code={`import { Toaster, toast } from '@halo-ui/react/toast';

export function App() {
  return (
    <>
      <Routes />
      <Toaster />
    </>
  );
}

toast.success('Invite sent', { description: 'They will get an email shortly' });`}
      />
      <Try>
        <Button size="sm" tone="primary" onClick={(event) => demos.success(event.currentTarget)}>
          Show a toast
        </Button>
      </Try>
      <H2 id="first-drawer">Your first drawer</H2>
      <P>A drawer is a native dialog with a handle and detents. Always include a title; it labels the dialog.</P>
      <CodeBlock
        label="share-sheet.tsx"
        code={`
<Drawer.Root snapPoints={[0.45, 0.92]}>
  <Drawer.Trigger>Share</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Handle />
    <Drawer.Title>Share project</Drawer.Title>
    <Drawer.Description>Anyone with the link can view.</Drawer.Description>
    <Drawer.Scroll>{/* long content */}</Drawer.Scroll>
    <Drawer.Close>Done</Drawer.Close>
  </Drawer.Content>
</Drawer.Root>`}
      />
      <Try>
        <DemoDrawer trigger="Open a drawer" size="sm" tone="primary" />
      </Try>
      <H2 id="requirements">Requirements</H2>
      <List
        items={[
          'React 18.2 or newer. No other dependencies.',
          'Every module starts with "use client", so it works in the Next.js App Router.',
          'Toast is 5.7 kB and Drawer 4.8 kB, minified and gzipped, springs included. Styles are 2.9 kB.',
        ]}
      />
    </>
  ),
};

const toastPage: DocPage = {
  slug: 'toast',
  title: 'Toast',
  lede: 'A spring-driven stack that fans out on hover, leaves when flung, and reads correctly to screen readers.',
  sections: [
    { id: 'api', title: 'Calling toast()' },
    { id: 'options', title: 'Options' },
    { id: 'toaster', title: 'Toaster props' },
    { id: 'only-in-halo', title: 'Only in Halo' },
    { id: 'accessibility', title: 'Keyboard and screen readers' },
    { id: 'vs-sonner', title: 'Next to Sonner' },
  ],
  body: () => (
    <>
      <H2 id="api">Calling toast()</H2>
      <P>Every call returns the toast's id, so you can update or dismiss it later.</P>
      <PropTable rows={toastFunctions} caption="toast functions" nameLabel="Function" />
      <CodeBlock
        label="examples.ts"
        code={`toast.promise(save(), {
  loading: 'Saving…',
  success: 'Saved',
  error: 'Could not save',
});

const id = toast.loading('Exporting');
toast.update(id, 'Export ready', { type: 'success' });`}
      />
      <Try>
        <Button size="sm" onClick={() => demos.promise()}>
          Promise
        </Button>
        <Button size="sm" onClick={() => demos.update()}>
          Update in place
        </Button>
        <Button size="sm" onClick={() => demos.error()}>
          Error with action
        </Button>
      </Try>
      <H2 id="options">Options</H2>
      <Plaque id="toast-options" title="Toast options" count={toastOptions.length}>
        <PropTable rows={toastOptions} caption="Toast options" nameLabel="Option" />
      </Plaque>
      <H2 id="toaster">Toaster props</H2>
      <P>Grouped by what they change. Every prop has its own link.</P>
      {toasterGroups.map((g) => (
        <Plaque key={g.id} id={`toaster-${g.id}`} title={g.title} count={g.rows.length}>
          <PropTable rows={g.rows} caption={`Toaster props: ${g.title}`} />
        </Plaque>
      ))}
      <H2 id="only-in-halo">Only in Halo</H2>
      <H3>Launch from the trigger</H3>
      <P>
        Pass <C>from</C> and the toast flies out of the element that caused it, then lands in the stack on a spring.
      </P>
      <CodeBlock label="save-button.tsx" code={`<button onClick={(e) => toast('Saved', { from: e.currentTarget })}>Save</button>`} />
      <H3>Streaming text</H3>
      <P>
        <C>toast.stream</C> accepts an AsyncIterable or a ReadableStream of strings, such as a model's reply. Screen readers hear it once, when it finishes.
      </P>
      <CodeBlock label="summary.ts" code={`await toast.stream(reply, { title: 'Summarising…', success: 'Summary ready' });`} />
      <H3>Undo with a countdown</H3>
      <CodeBlock label="archive.ts" code={`toast.undo('Conversation archived', { onUndo: restore });`} />
      <H3>Grouped repeats</H3>
      <CodeBlock label="upload.ts" code={`toast.success('File uploaded', { group: 'uploads' });`} />
      <Try>
        <Button size="sm" onClick={(event) => newDemos.launch(event.currentTarget)}>
          Launch
        </Button>
        <Button size="sm" onClick={() => newDemos.stream()}>
          Stream
        </Button>
        <Button size="sm" onClick={() => newDemos.undo()}>
          Undo
        </Button>
        <Button size="sm" onClick={() => newDemos.group()}>
          Group
        </Button>
      </Try>
      <H2 id="accessibility">Keyboard and screen readers</H2>
      <List
        items={[
          <>
            <C>Alt</C> + <C>T</C> focuses the newest toast. Tab moves through toasts and their buttons.
          </>,
          <>
            <C>Esc</C> dismisses the focused toast, and so do <C>Delete</C> and <C>Backspace</C> on the toast itself.
          </>,
          'Messages go through separate polite and assertive live regions, prefixed with their type. Errors interrupt.',
          'Timers pause while the stack is hovered, focused, or touched, and while the tab is hidden. Hidden toasts never count down.',
          'Toasts past the visible count are inert: they never block clicks or take focus.',
        ]}
      />
      <H2 id="vs-sonner">Next to Sonner</H2>
      <CompareTable caption="How Halo behaves next to Sonner, checked against Sonner's source." them="Sonner" rows={vsSonner} />
    </>
  ),
};

const drawerPage: DocPage = {
  slug: 'drawer',
  title: 'Drawer',
  lede: 'A sheet from any edge, built on the native <dialog>: top layer, focus trap, and Esc come from the platform.',
  sections: [
    { id: 'anatomy', title: 'Anatomy' },
    { id: 'root', title: 'Root props' },
    { id: 'parts', title: 'Parts' },
    { id: 'detents', title: 'Detents' },
    { id: 'recess', title: 'Pushing the page back' },
    { id: 'vs-vaul', title: 'Next to Vaul' },
  ],
  body: () => (
    <>
      <H2 id="anatomy">Anatomy</H2>
      <CodeBlock
        label="anatomy.tsx"
        code={`<Drawer.Root>
  <Drawer.Trigger />
  <Drawer.Content>
    <Drawer.Handle />
    <Drawer.Title />
    <Drawer.Description />
    <Drawer.Scroll />
    <Drawer.Close />
  </Drawer.Content>
</Drawer.Root>`}
      />
      <H2 id="root">Root props</H2>
      <Plaque id="drawer-root" title="Drawer.Root" count={drawerRootProps.length}>
        <PropTable rows={drawerRootProps} caption="Drawer.Root props" />
      </Plaque>
      <H2 id="parts">Parts</H2>
      <Plaque id="drawer-parts" title="Parts">
        <PropTable rows={drawerParts} caption="Drawer parts" nameLabel="Part" />
      </Plaque>
      <H2 id="detents">Detents</H2>
      <P>
        Snap points are viewport fractions or pixel strings, smallest first. When you let go, Halo picks the detent nearest where your flick would coast to, and hands your speed to the spring.
      </P>
      <CodeBlock label="detents.tsx" code={`<Drawer.Root snapPoints={[0.28, 0.6, '720px']} defaultSnapPoint={0.6}>`} />
      <List items={releaseSteps.map(([title, body]) => <><strong>{title}.</strong> {body}</>)} />
      <Try>
        <DemoDrawer trigger="Two detents" size="sm" />
        <DemoDrawer trigger="Three detents" size="sm" config={{ ...defaultDrawerConfig, snapPoints: 'three' }} />
        <DemoDrawer trigger="Side panel" size="sm" config={{ ...defaultDrawerConfig, side: 'right', snapPoints: 'none', recess: false }} />
        <DemoDrawer trigger="Must choose" size="sm" tone="outline" config={{ ...defaultDrawerConfig, snapPoints: 'none', dismissible: false }} />
      </Try>
      <H2 id="recess">Pushing the page back</H2>
      <P>
        Mark your app's outermost wrapper with <C>data-halo-recess</C> and pass <C>recess</C>. The page zooms out around the middle of the viewport on its own, bouncier spring.
      </P>
      <CodeBlock
        label="layout.tsx"
        code={`<div data-halo-recess>{children}</div>

<Drawer.Root recess={{ depth: 0.06, bounce: 0.42 }}>`}
      />
      <Note title="Why there is no portal">
        The native dialog renders in the browser's top layer, above everything, wherever it sits in your tree. No z-index fights, and focus is trapped by the platform.
      </Note>
      <H2 id="vs-vaul">Next to Vaul</H2>
      <CompareTable caption="How Halo behaves next to Vaul, checked against Vaul's source. Vaul's README now says it is unmaintained." them="Vaul" rows={vsVaul} />
    </>
  ),
};

const worldsPage: DocPage = {
  slug: 'worlds',
  title: 'Worlds',
  lede: 'A world is a complete material: surface, frost, edge, shadow, and type colours, in light and dark. Pick one with a prop.',
  sections: [
    { id: 'choosing', title: 'Choosing a world' },
    { id: 'all-worlds', title: 'All nine' },
    { id: 'intent', title: 'Colour by type' },
    { id: 'coats', title: 'Coat colours' },
  ],
  body: () => (
    <>
      <H2 id="choosing">Choosing a world</H2>
      <CodeBlock label="app.tsx" code={`<Toaster world="partition" />\n<Drawer.Root world="partition">`} />
      <H2 id="all-worlds">All nine</H2>
      <div className="my-6 grid gap-x-6 gap-y-8 sm:grid-cols-2">
        {worlds.map((w) => (
          <figure key={w.value} className="m-0">
            <MaterialSample world={w.value} />
            <figcaption className="mt-3">
              <span className="font-display text-title font-semibold">{w.name}</span>
              <code className="ml-2 text-label text-ink-faint">{w.value}</code>
              <span className="mt-1 block text-ui leading-[1.55] text-ink-soft">{w.line}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <H2 id="intent">Colour by type</H2>
      <P>
        <C>intent</C> shows each toast's type in colour, so success and error read apart even with icons off: <C>tint</C> washes the glass, <C>edge</C> colours the edge ring, <C>glow</C> casts light in the type colour.
      </P>
      <CodeBlock label="app.tsx" code={`<Toaster intent="edge" icons={false} />`} />
      <H2 id="coats">Coat colours</H2>
      <P>
        The Dichroic edge is three coat colours. Recolour it with <C>coat</C>. The playground's palettes are a starting point:
      </P>
      <CodeBlock label="app.tsx" code={`<Toaster coat={${JSON.stringify(coats.ember.colors)}} />`} />
    </>
  ),
};

const motionPage: DocPage = {
  slug: 'motion',
  title: 'Motion',
  lede: 'Every move is a spring with real velocity: entering, stacking, swiping away, and springing back.',
  sections: [
    { id: 'springs', title: 'Spring presets' },
    { id: 'custom', title: 'Custom springs' },
    { id: 'entrances', title: 'Entrances and exits' },
    { id: 'reduced', title: 'Reduced motion' },
    { id: 'engine', title: 'Using the engine' },
  ],
  body: () => (
    <>
      <H2 id="springs">Spring presets</H2>
      <div className="my-6 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        {springChoices.map((s) => (
          <figure key={s.value} className="m-0">
            <SpringCurve spring={s.value} />
            <figcaption className="mt-1 font-mono text-label text-ink">{s.value}</figcaption>
          </figure>
        ))}
      </div>
      <H2 id="custom">Custom springs</H2>
      <P>
        Describe a spring by how long it takes and how much it bounces, or by its physical constants.
      </P>
      <CodeBlock label="app.tsx" code={`<Toaster spring={{ duration: 0.3, bounce: 0.2 }} />\n<Toaster spring={{ stiffness: 520, damping: 30, mass: 1 }} />`} />
      <H2 id="entrances">Entrances and exits</H2>
      <PropTable rows={motions.map((m) => ({ name: m.value, type: 'motion', description: m.line }))} caption="Motion styles" nameLabel="motion" />
      <P>Each exit plays its entrance in reverse, without bounce.</P>
      <H2 id="reduced">Reduced motion</H2>
      <P>
        With <C>prefers-reduced-motion</C>, toasts fade instead of moving and the drawer jumps to its detents. Nothing is lost: every state change still happens.
      </P>
      <H2 id="engine">Using the engine</H2>
      <P>The spring solver is exported on its own, at 1.6 kB.</P>
      <CodeBlock
        label="pane.ts"
        code={`import { createSpringValue, createVelocityTracker, resolveSpring } from '@halo-ui/react/spring';

const x = createSpringValue(0, resolveSpring('pop'), (v) => {
  el.style.transform = \`translateX(\${v}px)\`;
});
x.to(240, { velocity: tracker.velocity() });`}
      />
    </>
  ),
};

const customizePage: DocPage = {
  slug: 'customize',
  title: 'Customize',
  lede: 'A world is one CSS selector. Write your own, extend a built-in one, or style any part with Tailwind. No config file.',
  sections: [
    { id: 'write', title: 'Write a world' },
    { id: 'extend', title: 'Extend a world' },
    { id: 'tailwind', title: 'Tailwind' },
    { id: 'tokens', title: 'Tokens' },
    { id: 'selectors', title: 'Selectors and states' },
  ],
  body: () => (
    <>
      <H2 id="write">Write a world</H2>
      <P>Pick a name, set the tokens, and pass the name to <C>world</C>. Halo's own token rules have zero specificity, so your selector always wins.</P>
      <CodeBlock
        label="midnight.css"
        code={`[data-halo-world='midnight'] {
  color-scheme: dark;
  --halo-surface: oklch(24% 0.06 278 / 0.74);
  --halo-surface-solid: oklch(21% 0.06 278);
  --halo-fg: oklch(96% 0.02 280);
  --halo-fg-muted: oklch(80% 0.05 280);
  --halo-blur: 24px;
  --halo-radius: 14px;
  --halo-world-edge: linear-gradient(to bottom,
    oklch(82% 0.12 290 / 0.65), oklch(62% 0.16 305 / 0.18));
  --halo-shadow: 0 22px 44px -22px oklch(22% 0.12 285 / 0.75);
}`}
      />
      <Try>
        <Button size="sm" tone="primary" onClick={() => toast.success('Midnight, from plain CSS', { toasterId: 'custom', description: 'One selector, nothing in the library' })}>
          Fire a Midnight toast
        </Button>
      </Try>
      <H2 id="extend">Extend a world</H2>
      <CodeBlock
        label="extend.css"
        code={`/* Change a built-in world everywhere */
[data-halo-world='dichroic'] {
  --halo-coat-a: oklch(78% 0.16 150);
  --halo-radius: 12px;
}`}
      />
      <P>Or change one instance with a Tailwind arbitrary property:</P>
      <CodeBlock label="app.tsx" code={`<Toaster className="[--halo-blur:8px]" />`} />
      <H2 id="tailwind">Tailwind</H2>
      <P>
        Import the stylesheet into a layer, then use <C>classNames</C> for every toast part, or <C>className</C> per toast.
      </P>
      <CodeBlock
        label="app.css"
        code={`@import 'tailwindcss';
@import '@halo-ui/react/styles.css' layer(components);`}
      />
      <CodeBlock
        label="app.tsx"
        code={`<Toaster
  classNames={{
    title: 'tracking-tight',
    action: 'bg-emerald-600 text-white',
  }}
/>

toast('Saved', { className: 'ring-2 ring-emerald-500/40' });`}
      />
      <H2 id="tokens">Tokens</H2>
      <Plaque id="token-list" title="Tokens">
        <PropTable rows={tokens} caption="Design tokens" nameLabel="Token" />
      </Plaque>
      <H2 id="selectors">Selectors and states</H2>
      <Plaque id="selector-list" title="Selectors and states">
        <PropTable rows={selectors} caption="Selectors" nameLabel="Selector" />
      </Plaque>
    </>
  ),
};

const recipes: ReadonlyArray<{ id: string; title: string; when: string; prompt: () => string }> = [
  {
    id: 'recipe-toasts',
    title: 'Add toasts',
    when: 'A new app, or one with no notification system yet.',
    prompt: () => `Add Halo toasts to this React app. Read ${LLMS_URL} first.
1. npm i @halo-ui/react, and import '@halo-ui/react/styles.css' once in the root layout or entry file.
2. Render <Toaster /> once near the root, inside providers and outside the router outlet.
3. Use toast.success / toast.error / toast.info / toast.warning for outcomes, toast.promise for async work, and toast.update(id, ...) to change a toast in place instead of stacking another.
4. Give actions as { action: { label, onClick } }.
Keep messages short: a title, plus a description only when it adds something.`,
  },
  {
    id: 'recipe-sonner',
    title: 'Migrate from Sonner',
    when: 'The app imports from "sonner".',
    prompt: () => `Replace Sonner with Halo in this app. Read ${LLMS_URL} first.
- Change imports from 'sonner' to '@halo-ui/react/toast', and add import '@halo-ui/react/styles.css' once.
- toast(), toast.success/error/warning/info/loading, toast.promise, and toast.dismiss keep the same call shapes.
- <Toaster> props: position, expand, visibleToasts, and closeButton carry over unchanged.
- richColors becomes intent="tint". toastOptions.classNames becomes classNames on <Toaster>.
- Remove any custom CSS that overrides Sonner's transform or transition. Halo's motion is springs in JavaScript.
Do not change message text. Run the app and confirm toasts appear, stack, and dismiss.`,
  },
  {
    id: 'recipe-drawer',
    title: 'Add a drawer',
    when: 'A mobile sheet, a share sheet, or a side panel.',
    prompt: () => `Add a Halo drawer. Read ${LLMS_URL} first.
Use Drawer.Root > Drawer.Trigger + Drawer.Content > Drawer.Handle, Drawer.Title (required), Drawer.Description, Drawer.Scroll around long content, and Drawer.Close.
Snap points are viewport fractions or '320px' strings, smallest first. For side panels use side="right" with no snap points.
Do not add a portal or an overlay component: Drawer.Content is a native <dialog> and handles both.`,
  },
  {
    id: 'recipe-vaul',
    title: 'Migrate from Vaul',
    when: 'The app imports from "vaul".',
    prompt: () => `Replace Vaul with Halo's Drawer. Read ${LLMS_URL} first.
- Change imports from 'vaul' to '@halo-ui/react/drawer'.
- Delete Drawer.Portal and Drawer.Overlay wrappers. Drawer.Content is a native dialog with its own overlay.
- snapPoints carries over. activeSnapPoint + setActiveSnapPoint become activeSnapPoint + onActiveSnapPointChange.
- direction becomes side.
- shouldScaleBackground becomes recess, and the [data-vaul-drawer-wrapper] element gets data-halo-recess instead.
- Keep Drawer.Title in every drawer; it labels the dialog.`,
  },
  {
    id: 'recipe-stream',
    title: 'Stream an AI reply',
    when: 'Long-running model output that should show progress.',
    prompt: () => `When the app streams a model reply, show it with toast.stream(source, { title: 'Summarising…', success: 'Summary ready' }).
The source must be an AsyncIterable<string> or ReadableStream<string> of text chunks. Await the returned promise for the full text.
Do not also announce the text elsewhere; Halo announces it once, when it finishes.`,
  },
  {
    id: 'recipe-undo',
    title: 'Make destructive actions undoable',
    when: 'Archive, delete, remove, or move.',
    prompt: () => `For each destructive action, apply it optimistically, then call toast.undo('Conversation archived', { onUndo: restore }), where restore reverses it.
Do not add confirmation dialogs where undo is possible.`,
  },
];

const agentsPage: DocPage = {
  slug: 'agents',
  title: 'For agents',
  lede: 'Most installs now happen through an AI agent. These recipes give it one obvious way to do each thing, with the rules that keep the result accessible.',
  sections: [
    { id: 'llms', title: 'llms.txt' },
    { id: 'recipes', title: 'Recipes' },
    { id: 'nextjs', title: 'Next.js and SSR' },
    { id: 'rules', title: 'Rules for agents' },
    { id: 'playground', title: 'Prompts from the playground' },
  ],
  body: () => (
    <>
      <H2 id="llms">llms.txt</H2>
      <P>
        The whole API in one plain-text file: install, every prop, every rule. Every recipe below starts by pointing your agent at{' '}
        <a href="/llms.txt" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          /llms.txt
        </a>
        .
      </P>
      <H2 id="recipes">Recipes</H2>
      <P>Copy the one that matches the job.</P>
      {recipes.map((r) => (
        <section key={r.id} id={r.id} className="scroll-mt-32 lg:scroll-mt-24">
          <H3>{r.title}</H3>
          <P className="mt-0 mb-3">{r.when}</P>
          <CodeBlock label={`${r.id.replace('recipe-', '')}.md`} wrap copyLabel="Copy prompt" code={r.prompt()} />
        </section>
      ))}
      <H2 id="nextjs">Next.js and SSR</H2>
      <List
        items={[
          <>
            Every Halo module starts with <C>'use client'</C>, so you can import it from server components. Halo renders on the client.
          </>,
          <>
            Import <C>@halo-ui/react/styles.css</C> in <C>app/layout.tsx</C> and put <C>{'<Toaster />'}</C> in the root layout's body.
          </>,
          <>
            Call <C>toast()</C> from client code, such as event handlers, or after a server action resolves on the client.
          </>,
          <>
            For the drawer's recess, add <C>data-halo-recess</C> to the element that wraps your page content inside <C>{'<body>'}</C>.
          </>,
        ]}
      />
      <H2 id="rules">Rules for agents</H2>
      <List
        items={[
          'Import the stylesheet once. Never restyle transform, opacity, or transition on toasts or drawer panels.',
          'Customize through CSS custom properties, classNames, or a world. Never through !important.',
          'Keep Drawer.Title in every drawer. Use Drawer.Description when there is supporting text.',
          'Never put information that exists nowhere else in a toast. Toasts disappear.',
          'Leave the reduced-motion, reduced-transparency, and higher-contrast handling alone. It is built in.',
        ]}
      />
      <H2 id="playground">Prompts from the playground</H2>
      <P>
        Every playground state turns into a prompt with exact code. Build the toast you want, switch the output to Agent prompt, and copy.
      </P>
    </>
  ),
};

export const docPages: readonly DocPage[] = [gettingStarted, toastPage, drawerPage, worldsPage, motionPage, customizePage, agentsPage];
