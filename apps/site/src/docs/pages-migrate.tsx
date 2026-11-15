import { CodeBlock } from '../components/code-block';
import { CompareTable } from '../components/compare-table';
import { Link } from '../components/link';
import { sizes } from '../lib/package-facts';
import { vsSonner, vsVaul } from './comparisons';
import type { DocPage } from './pages';
import { C, H2, List, Note, P } from './prose';
import { recipePrompt } from './recipes';

const link = 'text-ink underline decoration-line underline-offset-4 hover:decoration-ink';

const sonnerMap: ReadonlyArray<readonly [string, string, string]> = [
  ['Import', "import { Toaster, toast } from 'sonner'", "import { Toaster, toast } from 'halo-ui-react/toast', plus import 'halo-ui-react/styles.css' once"],
  ['Calls', 'toast(), toast.success / error / warning / info / loading, toast.promise, toast.dismiss', 'The same calls with the same arguments. Each returns the toast id.'],
  ['Update in place', "toast('Done', { id })", "toast('Done', { id }) still works, or toast.update(id, 'Done', options)"],
  ['toast.message', "toast.message('Title', { description })", "toast('Title', { description })"],
  ['Per-toast options', 'description, action, duration, icon, id, dismissible, important, onDismiss, onAutoClose, toasterId, className', 'The same names and meanings.'],
  ['Colour by type', 'richColors', 'intent="tint" on <Toaster>, or "edge" or "glow"'],
  ['Toaster placement', 'position, expand, visibleToasts, gap, offset', 'The same names. offset is a number of pixels.'],
  ['Close button', 'closeButton', 'closeButton. It is on by default in Halo.'],
  ['Hotkey', "hotkey={['altKey', 'KeyT']}", 'The same format and the same default.'],
  ['Theme', "theme: 'light' | 'dark' | 'system' (default 'light')", "theme: 'light' | 'dark' | 'system' (default 'system')"],
  ['Landmark name', 'containerAriaLabel', 'label on <Toaster>'],
  ['Shared toast options', 'toastOptions={{ classNames, duration, className }}', 'classNames and duration directly on <Toaster>; className per toast'],
  ['Multiple toasters', '<Toaster id> and toast(…, { toasterId })', 'The same.'],
];

const sonnerGaps = [
  <>
    <C>toast.custom()</C> and <C>unstyled</C>. Halo always renders its own pane. Title and description take any React node, and every part takes a class through{' '}
    <C>classNames</C>.
  </>,
  <>
    The <C>cancel</C> button. A toast has one <C>action</C>. For undo, use <C>toast.undo()</C>, which puts the countdown on the button.
  </>,
  <>
    <C>position</C> on a single toast. Position belongs to the <C>{'<Toaster>'}</C>; send a toast to a second toaster with <C>toasterId</C>.
  </>,
  <>
    <C>invert</C>, <C>dir</C>, <C>mobileOffset</C> and <C>swipeDirections</C>. Below 600px Halo's toasts go full width, and they swipe toward the nearest edge.
  </>,
  <>
    A custom icon set through the <C>icons</C> object. Halo's <C>icons</C> is on or off; pass <C>icon</C> on a toast to replace one.
  </>,
  <>
    <C>toast.getHistory()</C>, <C>toast.getToasts()</C> and <C>useSonner()</C>. Use <C>toast.isActive(id)</C> to check one toast.
  </>,
];

const vaulMap: ReadonlyArray<readonly [string, string, string]> = [
  ['Import', "import { Drawer } from 'vaul'", "import { Drawer } from 'halo-ui-react/drawer', plus import 'halo-ui-react/styles.css' once"],
  ['Parts', 'Root, Trigger, Portal, Overlay, Content, Handle, Title, Description, Close', 'Root, Trigger, Content, Handle, Title, Description, Close, and Scroll for long content'],
  ['Portal and overlay', '<Drawer.Portal> and <Drawer.Overlay>', 'Delete both. Content is a native <dialog> in the top layer with its own overlay; overlay={false} hides it.'],
  ['Open state', 'open, defaultOpen, onOpenChange', 'The same.'],
  ['Edge', "direction: 'top' | 'bottom' | 'left' | 'right'", 'side, with the same values'],
  ['Detents', "snapPoints={[0.4, '355px', 1]}", 'snapPoints, with the same values, smallest first'],
  ['Active detent', 'activeSnapPoint + setActiveSnapPoint', 'activeSnapPoint + onActiveSnapPointChange, or defaultSnapPoint uncontrolled'],
  ['Scale the page', 'shouldScaleBackground and [data-vaul-drawer-wrapper]', 'recess and [data-halo-recess]'],
  ['Cannot be dismissed', 'dismissible={false}', 'dismissible={false}'],
  ['Handle', '<Drawer.Handle /> is a div', '<Drawer.Handle /> is a button: press it to cycle detents, or use the arrow keys'],
];

const vaulGaps = [
  <>
    <C>modal={'{false}'}</C>. Halo's drawer is always modal: it opens with <C>showModal()</C>, so the page behind it is inert.
  </>,
  <>
    <C>Drawer.NestedRoot</C> and <C>nested</C>. Nested drawers are not documented yet.
  </>,
  <>
    <C>handleOnly</C>, <C>closeThreshold</C>, <C>fadeFromIndex</C> and <C>snapToSequentialPoint</C>. Halo picks the detent from where your flick would coast to.
  </>,
  <>
    <C>onDrag</C>, <C>onRelease</C>, <C>onClose</C> and <C>onAnimationEnd</C>. Halo reports <C>onOpenChange</C> and <C>onActiveSnapPointChange</C>.
  </>,
  <>
    <C>container</C>, <C>fixed</C>, <C>repositionInputs</C>, <C>noBodyStyles</C>, <C>setBackgroundColorOnScale</C>, <C>scrollLockTimeout</C> and{' '}
    <C>disablePreventScroll</C>. Page scroll is always locked while the drawer is open, and <C>Drawer.Scroll</C> handles scrolling inside it.
  </>,
];

export const migrateSonnerPage: DocPage = {
  slug: 'migrate/sonner',
  title: 'Migrate from Sonner',
  lede: 'Halo takes the same toast() calls as Sonner, so most of a migration is an import change. This page maps every prop and lists what does not carry over.',
  sections: [
    { id: 'steps', title: 'Steps' },
    { id: 'diff', title: 'The change' },
    { id: 'mapping', title: 'Prop by prop' },
    { id: 'gaps', title: 'What does not carry over' },
    { id: 'behaviour', title: 'What changes in behaviour' },
    { id: 'prompt', title: 'Hand it to an agent' },
  ],
  body: () => (
    <>
      <H2 id="steps">Steps</H2>
      <List
        items={[
          <>
            Install: <C>npm i halo-ui-react</C>, and remove <C>sonner</C> when you are done.
          </>,
          <>
            Change imports from <C>'sonner'</C> to <C>'halo-ui-react/toast'</C>, and import <C>halo-ui-react/styles.css</C> once at the root.
          </>,
          <>
            Replace <C>richColors</C> with <C>intent="tint"</C> and move <C>toastOptions</C> onto the <C>{'<Toaster>'}</C>. The table below covers the rest.
          </>,
          'Delete any CSS that overrides the toast transform or transition. Halo moves toasts with springs in JavaScript.',
          'Run the app and fire a success, an error, and a promise toast.',
        ]}
      />
      <H2 id="diff">The change</H2>
      <CodeBlock
        label="layout.diff"
        code={`- import { Toaster, toast } from 'sonner';
+ import { Toaster, toast } from 'halo-ui-react/toast';
+ import 'halo-ui-react/styles.css';

- <Toaster richColors position="top-center" toastOptions={{ duration: 5000 }} />
+ <Toaster intent="tint" position="top-center" duration={5000} />

  toast.success('Invite sent', { description: 'They will get an email shortly' });
  toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Could not save' });`}
      />
      <H2 id="mapping">Prop by prop</H2>
      <CompareTable caption="Sonner API on the left, the Halo equivalent on the right." them="Sonner" rows={sonnerMap} />
      <H2 id="gaps">What does not carry over</H2>
      <P>These Sonner features have no direct equivalent in Halo {'0.1'}. Check them before you switch.</P>
      <List items={sonnerGaps} />
      <H2 id="behaviour">What changes in behaviour</H2>
      <P>The calls stay the same; what happens on screen does not. Each row was checked against Sonner's source.</P>
      <CompareTable caption="How Halo behaves next to Sonner." them="Sonner" rows={vsSonner} />
      <P>
        Halo's toast entry is {sizes.toast} kB minified and gzipped, springs included. Sonner was written by Emil Kowalski; Halo keeps its call shapes on purpose, so moving
        between the two stays cheap.
      </P>
      <H2 id="prompt">Hand it to an agent</H2>
      <CodeBlock label="migrate-sonner.md" wrap copyLabel="Copy prompt" code={recipePrompt('recipe-sonner')} />
    </>
  ),
};

export const migrateVaulPage: DocPage = {
  slug: 'migrate/vaul',
  title: 'Migrate from Vaul',
  lede: 'Halo’s Drawer keeps Vaul’s part names and snap points, and drops the portal and overlay: it is a native dialog. Vaul’s README says the project is unmaintained.',
  sections: [
    { id: 'steps', title: 'Steps' },
    { id: 'diff', title: 'The change' },
    { id: 'mapping', title: 'Prop by prop' },
    { id: 'gaps', title: 'What does not carry over' },
    { id: 'behaviour', title: 'What changes in behaviour' },
    { id: 'prompt', title: 'Hand it to an agent' },
  ],
  body: () => (
    <>
      <H2 id="steps">Steps</H2>
      <List
        items={[
          <>
            Install: <C>npm i halo-ui-react</C>, and remove <C>vaul</C> when you are done.
          </>,
          <>
            Change imports from <C>'vaul'</C> to <C>'halo-ui-react/drawer'</C>, and import <C>halo-ui-react/styles.css</C> once at the root.
          </>,
          <>
            Delete every <C>Drawer.Portal</C> and <C>Drawer.Overlay</C>, keeping what was inside the portal.
          </>,
          <>
            Rename <C>direction</C> to <C>side</C>, <C>setActiveSnapPoint</C> to <C>onActiveSnapPointChange</C>, and <C>shouldScaleBackground</C> to <C>recess</C>.
          </>,
          <>
            Keep a <C>Drawer.Title</C> in every drawer; it names the dialog. Wrap long content in <C>Drawer.Scroll</C>.
          </>,
        ]}
      />
      <H2 id="diff">The change</H2>
      <CodeBlock
        label="share-sheet.diff"
        code={`- import { Drawer } from 'vaul';
+ import { Drawer } from 'halo-ui-react/drawer';

- <Drawer.Root snapPoints={[0.45, 0.92]} shouldScaleBackground>
+ <Drawer.Root snapPoints={[0.45, 0.92]} recess>
    <Drawer.Trigger>Share</Drawer.Trigger>
-   <Drawer.Portal>
-     <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Title>Share project</Drawer.Title>
-       {links}
+       <Drawer.Scroll>{links}</Drawer.Scroll>
      </Drawer.Content>
-   </Drawer.Portal>
  </Drawer.Root>`}
      />
      <H2 id="mapping">Prop by prop</H2>
      <CompareTable caption="Vaul API on the left, the Halo equivalent on the right." them="Vaul" rows={vaulMap} />
      <H2 id="gaps">What does not carry over</H2>
      <P>These Vaul options have no direct equivalent in Halo {'0.1'}. Check them before you switch.</P>
      <List items={vaulGaps} />
      <H2 id="behaviour">What changes in behaviour</H2>
      <CompareTable caption="How Halo behaves next to Vaul, checked against Vaul's source." them="Vaul" rows={vsVaul} />
      <Note title="No Radix">
        Vaul builds on Radix Dialog. Halo’s drawer uses the browser’s <C>{'<dialog>'}</C>, so the top layer, focus trap and Esc come from the platform, and the drawer entry is{' '}
        {sizes.drawer} kB minified and gzipped.
      </Note>
      <P>
        Vaul was written by Emil Kowalski and shaped how drawers feel on the web. If you are also replacing Sonner, see{' '}
        <Link href="/docs/migrate/sonner" className={link}>
          Migrate from Sonner
        </Link>
        .
      </P>
      <H2 id="prompt">Hand it to an agent</H2>
      <CodeBlock label="migrate-vaul.md" wrap copyLabel="Copy prompt" code={recipePrompt('recipe-vaul')} />
    </>
  ),
};
