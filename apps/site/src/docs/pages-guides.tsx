import { CodeBlock } from '../components/code-block';
import { Link } from '../components/link';
import { GITHUB_URL } from '../lib/site';
import type { DocPage } from './pages';
import { C, H2, H3, List, Note, P } from './prose';

const link = 'text-ink underline decoration-line underline-offset-4 hover:decoration-ink';

export const nextjsPage: DocPage = {
  slug: 'nextjs',
  title: 'Next.js and SSR',
  lede: 'Halo works in the App Router. The Toaster goes in the root layout; drawers live in client components; toast() runs on the client.',
  sections: [
    { id: 'layout', title: 'The root layout' },
    { id: 'drawers', title: 'Drawers in client components' },
    { id: 'server-actions', title: 'Toasts after a server action' },
    { id: 'recess', title: 'Pushing the page back' },
    { id: 'theme', title: 'Following your dark mode' },
  ],
  body: () => (
    <>
      <H2 id="layout">The root layout</H2>
      <P>
        Every Halo module starts with <C>'use client'</C>, so a server component can render <C>{'<Toaster />'}</C> directly. Import the stylesheet once in the same file.
      </P>
      <CodeBlock
        label="app/layout.tsx"
        code={`import { Toaster } from 'halo-ui-react/toast';
import 'halo-ui-react/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div data-halo-recess>{children}</div>
        <Toaster />
      </body>
    </html>
  );
}`}
      />
      <H2 id="drawers">Drawers in client components</H2>
      <P>
        <C>Drawer</C> is a namespace of parts exported from a client module. A server component can render a client component, but it cannot reach into a client
        module’s exports, so <C>{'<Drawer.Root>'}</C> belongs in a file marked <C>'use client'</C>. Pass server data in as props.
      </P>
      <Note title="Seeing “Element type is invalid … got: undefined”?">
        That is Next.js rendering <C>{'<Drawer.Root>'}</C> from a server component. Move the drawer into a client component like the one below. Checked with Next.js 16.4.
      </Note>
      <CodeBlock
        label="app/share-sheet.tsx"
        code={`'use client';

import { Drawer } from 'halo-ui-react/drawer';

export function ShareSheet({ url }: { url: string }) {
  return (
    <Drawer.Root snapPoints={[0.45, 0.92]} recess>
      <Drawer.Trigger>Share</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Title>Share project</Drawer.Title>
        <Drawer.Scroll>{url}</Drawer.Scroll>
      </Drawer.Content>
    </Drawer.Root>
  );
}`}
      />
      <H2 id="server-actions">Toasts after a server action</H2>
      <P>
        <C>toast()</C> runs in the browser. Call it from the client code that starts the action, after it resolves, or wrap the action in <C>toast.promise</C>.
      </P>
      <CodeBlock
        label="app/invite-button.tsx"
        code={`'use client';

import { toast } from 'halo-ui-react/toast';
import { sendInvite } from './actions';

export function InviteButton({ email }: { email: string }) {
  return (
    <button
      onClick={() =>
        toast.promise(sendInvite(email), {
          loading: 'Sending invite…',
          success: 'Invite sent',
          error: 'Could not send the invite',
        })
      }
    >
      Invite
    </button>
  );
}`}
      />
      <H2 id="recess">Pushing the page back</H2>
      <P>
        For <C>recess</C>, put <C>data-halo-recess</C> on the element that wraps your page inside <C>{'<body>'}</C>, as in the layout above. Keep the Toaster outside it.
        Drawers render in the browser’s top layer, so they stay put while the page moves behind them.
      </P>
      <H2 id="theme">Following your dark mode</H2>
      <P>
        <C>theme</C> defaults to <C>'system'</C>. If your app has its own switch, pass its resolved value to the Toaster and to each Drawer.Root from a client component.
      </P>
      <CodeBlock
        label="app/toaster.tsx"
        code={`'use client';

import { useTheme } from 'next-themes';
import { Toaster as HaloToaster } from 'halo-ui-react/toast';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return <HaloToaster theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />;
}`}
      />
    </>
  ),
};

export const accessibilityPage: DocPage = {
  slug: 'accessibility',
  title: 'Accessibility',
  lede: 'What the toast and drawer do for keyboard, screen-reader, and reduced-motion users, and how it is tested.',
  sections: [
    { id: 'announcements', title: 'Announcements' },
    { id: 'toast-keyboard', title: 'Toast keyboard' },
    { id: 'drawer', title: 'Drawer focus and keyboard' },
    { id: 'preferences', title: 'Motion, transparency, contrast' },
    { id: 'targets', title: 'Targets' },
    { id: 'your-part', title: 'Your part' },
    { id: 'testing', title: 'How it is tested' },
  ],
  body: () => (
    <>
      <H2 id="announcements">Announcements</H2>
      <List
        items={[
          'Each Toaster has two live regions, one polite and one assertive. Every message is announced with its type first, for example “Error: Upload failed”.',
          <>
            Errors use the assertive region and interrupt. Set <C>important</C> on any toast to do the same, or turn it off for an error that can wait.
          </>,
          <>
            <C>toast.stream()</C> is announced once, when the text finishes, not word by word. A <C>group</C> of repeats is announced with its count, such as “3 times”.
          </>,
          <>
            Each Toaster is a landmark named by <C>label</C> (default “Notifications”). Give extra toasters their own label.
          </>,
        ]}
      />
      <H2 id="toast-keyboard">Toast keyboard</H2>
      <List
        items={[
          <>
            <C>Alt</C> + <C>T</C> moves focus to the newest toast. Change it with <C>hotkey</C>.
          </>,
          'Tab moves through toasts and their buttons.',
          <>
            <C>Esc</C> dismisses the focused toast, and so do <C>Delete</C> and <C>Backspace</C> when the toast itself has focus.
          </>,
          'Timers pause while the stack is hovered, focused or touched, and while the tab is hidden. A toast tucked behind the deck does not count down.',
          'Toasts past visibleToasts are inert: they never block clicks on the page or take focus.',
        ]}
      />
      <H2 id="drawer">Drawer focus and keyboard</H2>
      <List
        items={[
          <>
            The drawer is a native <C>{'<dialog>'}</C> opened as a modal: the browser traps focus inside it, makes the page behind it inert, and closes it on <C>Esc</C>.
          </>,
          <>
            Focus moves into the panel on open, or to an element with <C>autofocus</C> or <C>data-autofocus</C>, and returns to the trigger on close.
          </>,
          <>
            <C>Drawer.Title</C> names the dialog and <C>Drawer.Description</C> describes it. The trigger sets <C>aria-expanded</C> and <C>aria-haspopup</C>.
          </>,
          <>
            <C>Drawer.Handle</C> is a real button. Press it to cycle detents; the arrow keys step toward open or closed.
          </>,
          <>
            With <C>dismissible={'{false}'}</C>, swiping, <C>Esc</C> and the overlay no longer close it. Give the user a button that does.
          </>,
        ]}
      />
      <H2 id="preferences">Motion, transparency, contrast</H2>
      <List
        items={[
          <>
            <C>prefers-reduced-motion</C>: toasts fade instead of moving, whatever <C>motion</C> is set to, and the drawer jumps to its detents. Every state change still happens.
          </>,
          <>
            <C>prefers-reduced-transparency</C> and <C>prefers-contrast: more</C>: the frosted surface is replaced by a solid one. Browsers without <C>backdrop-filter</C> get
            the same solid surface.
          </>,
        ]}
      />
      <H2 id="targets">Targets</H2>
      <P>
        On coarse pointers, toast actions and close buttons get a 44 px hit area without changing how they look. The drawer handle is a 120 × 32 px button around its
        visible grabber.
      </P>
      <H2 id="your-part">Your part</H2>
      <List
        items={[
          'Never put information in a toast that exists nowhere else. Toasts disappear.',
          'Keep a Drawer.Title in every drawer, even if you hide it visually.',
          'Do not override transform, opacity or transition on toasts or drawer panels, and leave the reduced-motion, transparency and contrast handling in place.',
        ]}
      />
      <H2 id="testing">How it is tested</H2>
      <P>
        Every pull request runs axe-core (WCAG 2.2 AA and best practices) on the home page, the playground and a docs page in light and dark, a keyboard walk that checks
        every stop shows a focus ring, and a reduced-motion check, all in Chromium. The library’s tests cover the type labels screen readers hear, keyboard dismissal,
        inert hidden toasts, and the drawer’s labelling, focus and Escape handling. The suites are in the{' '}
        <a href={GITHUB_URL} className={link}>
          repository
        </a>
        .
      </P>
      <Note title="Found a problem?">
        Open an issue on{' '}
        <a href={`${GITHUB_URL}/issues`} className={link}>
          GitHub
        </a>{' '}
        with the browser, the assistive technology, and what you expected to hear or reach. Accessibility bugs are fixed first.
      </Note>
      <H3>Related</H3>
      <P>
        Keyboard and announcement details for each prop are in the{' '}
        <Link href="/docs/toast" className={link}>
          Toast
        </Link>{' '}
        and{' '}
        <Link href="/docs/drawer" className={link}>
          Drawer
        </Link>{' '}
        references.
      </P>
    </>
  ),
};
