import { CodeBlock } from '../components/code-block';
import { DemoPopover, PlacementPopovers } from '../components/demo-popover';
import { SwipePlayground } from '../components/demo-swipe';
import { sizes } from '../lib/package-facts';
import { popoverParts, popoverRootProps, swipeGroupProps, swipeParts } from './api';
import type { DocPage } from './pages';
import { Plaque } from './plaque';
import { PropTable } from './prop-table';
import { C, H2, List, Note, P } from './prose';

export const popoverPage: DocPage = {
  slug: 'popover',
  title: 'Popover',
  lede: 'A non-modal popover on the native popover API. The browser places it, closes it, and returns focus; Halo grows it out of the trigger and lights the edge that faces it.',
  sections: [
    { id: 'anatomy', title: 'Anatomy' },
    { id: 'root', title: 'Root props' },
    { id: 'parts', title: 'Parts' },
    { id: 'placement', title: 'Placement and light' },
    { id: 'platform', title: 'What the browser does' },
  ],
  body: () => (
    <>
      <H2 id="anatomy">Anatomy</H2>
      <CodeBlock
        label="share.tsx"
        code={`import { Popover } from 'halo-ui-react/popover';

<Popover.Root side="bottom" align="center">
  <Popover.Trigger>Share</Popover.Trigger>
  <Popover.Popup>
    <Popover.Title>Share “Spring launch”</Popover.Title>
    <Popover.Description>Anyone with the link can view.</Popover.Description>
    <button data-autofocus>Copy link</button>
    <Popover.Close>Done</Popover.Close>
  </Popover.Popup>
</Popover.Root>`}
      />
      <div className="my-4">
        <DemoPopover trigger="Share" />
      </div>
      <P>
        Popover is {sizes.popover} kB min+gzip with the springs, and needs no positioning library.
      </P>
      <H2 id="root">Root props</H2>
      <Plaque id="popover-root" title="Popover.Root" count={popoverRootProps.length}>
        <PropTable rows={popoverRootProps} caption="Popover.Root props" />
      </Plaque>
      <H2 id="parts">Parts</H2>
      <Plaque id="popover-parts" title="Parts">
        <PropTable rows={popoverParts} caption="Popover parts" nameLabel="Part" />
      </Plaque>
      <H2 id="placement">Placement and light</H2>
      <P>
        The popover starts at the size and place of its trigger and grows into position on a spring, with its contents fading in once the glass is mostly open. There is no arrow. The coat ring runs all the way round, and its gradient radiates from the point where the popover meets the trigger, so the light shows where it attaches.
      </P>
      <div className="my-4">
        <PlacementPopovers />
      </div>
      <P>
        CSS anchor positioning keeps it next to the trigger as the page scrolls, and flips it when there is no room. In browsers without anchor positioning, Halo measures and places it instead.
      </P>
      <H2 id="platform">What the browser does</H2>
      <List
        items={[
          <>
            <strong>Top layer.</strong> No portal, no z-index. It renders above everything wherever it sits in your tree.
          </>,
          <>
            <strong>Closing.</strong> Esc and a click outside close it. So does the trigger, and opening another popover.
          </>,
          <>
            <strong>Focus.</strong> Opening moves focus inside, as a non-modal dialog should. Closing returns focus to the trigger if it was inside. Tab moves through the popover right after the trigger.
          </>,
          <>
            <strong>Nesting.</strong> A trigger inside a popover opens a child that stays open with its parent.
          </>,
          <>
            <strong>Scrolling away.</strong> The popover follows its trigger as the page scrolls. Once the trigger scrolls out of view or under something that covers it, like a sticky header, the popover closes back into it, and focus goes to the trigger without moving the page. This is Halo's part; the browser would leave it floating.
          </>,
        ]}
      />
      <Note title="Name it">
        The popover attribute gives no role or name. Halo adds <C>role="dialog"</C>; you name it with <C>Popover.Title</C>, or an <C>aria-label</C> on the popup.
      </Note>
      <P>
        Closing plays its exit where the browser supports animating out of the top layer (the CSS <C>overlay</C> property). Elsewhere it closes at once.
      </P>
    </>
  ),
};

export const swipePage: DocPage = {
  slug: 'swipe',
  title: 'Swipe actions',
  lede: 'Swipe a row to uncover its actions, or all the way to run one. The row is glass, so the actions sharpen into view as it moves off them.',
  sections: [
    { id: 'anatomy', title: 'Anatomy' },
    { id: 'release', title: 'How a release is decided' },
    { id: 'group', title: 'Group props' },
    { id: 'parts', title: 'Parts' },
    { id: 'undo', title: 'Undo with a toast' },
    { id: 'access', title: 'Without a swipe' },
  ],
  body: () => (
    <>
      <H2 id="anatomy">Anatomy</H2>
      <CodeBlock
        label="inbox.tsx"
        code={`import { Swipe } from 'halo-ui-react/swipe';

<Swipe.Group aria-label="Invoices">
  {invoices.map((invoice) => (
    <Swipe.Root key={invoice.id}>
      <Swipe.Content>{invoice.client}</Swipe.Content>
      <Swipe.Actions side="end">
        <Swipe.Action aria-label={\`Flag invoice \${invoice.id}\`} onClick={() => flag(invoice)}>
          Flag
        </Swipe.Action>
        <Swipe.Action commit aria-label={\`Archive invoice \${invoice.id}\`} onClick={() => archive(invoice)}>
          Archive
        </Swipe.Action>
      </Swipe.Actions>
    </Swipe.Root>
  ))}
</Swipe.Group>`}
      />
      <div className="my-6 max-w-[440px]">
        <SwipePlayground />
      </div>
      <P>
        Swipe is {sizes.swipe} kB min+gzip with the springs.
      </P>
      <H2 id="release">How a release is decided</H2>
      <List
        items={[
          <>
            <strong>Open.</strong> If your flick would coast at least halfway across the actions, the row opens to show them, carrying your speed into the spring.
          </>,
          <>
            <strong>Run.</strong> If the row already shows its actions and your flick would carry it past the commit point, the commit action runs. Past that point the edge lights up and the action grows, and phones get a short vibration.
          </>,
          <>
            <strong>Stop at the buttons.</strong> With <C>fullSwipe={'{false}'}</C> on the Group or a Root, a swipe always rests with the actions showing, however far it goes. The commit action keeps its emphasis but needs a tap. Use it when choosing matters more than speed.
          </>,
          <>
            <strong>Close.</strong> Anything shorter, or a flick back, slides it closed. A flick on a closed row opens it; it does not run an action.
          </>,
          <>
            <strong>Scroll.</strong> A mostly vertical drag is left to the page, and closes an open row.
          </>,
        ]}
      />
      <H2 id="group">Group props</H2>
      <Plaque id="swipe-group" title="Swipe.Group" count={swipeGroupProps.length}>
        <PropTable rows={swipeGroupProps} caption="Swipe.Group props" />
      </Plaque>
      <H2 id="parts">Parts</H2>
      <Plaque id="swipe-parts" title="Parts">
        <PropTable rows={swipeParts} caption="Swipe parts" nameLabel="Part" />
      </Plaque>
      <H2 id="undo">Undo with a toast</H2>
      <P>
        Swipes are quick, so the easiest guard against a mistake is undo rather than a confirmation. Remove the item, then offer it back. The toast announces itself, and the Group closes the gap on a spring.
      </P>
      <CodeBlock
        label="archive.ts"
        code={`const archive = (invoice) => {
  setInvoices((all) => all.filter((item) => item.id !== invoice.id));
  toast.undo(\`Invoice \${invoice.id} archived\`, {
    onUndo: () => setInvoices((all) => restore(all, invoice)),
  });
};`}
      />
      <H2 id="access">Without a swipe</H2>
      <List
        items={[
          <>
            <strong>Every action is a button.</strong> Tab reaches it, and the row slides open so you can see what has focus. Esc closes the row.
          </>,
          <>
            <strong>One code path.</strong> A full swipe clicks the commit button itself, so swipe, click, keyboard and screen reader all run the same <C>onClick</C>.
          </>,
          <>
            <strong>Focus moves on.</strong> When the focused row is removed, focus goes to the row now in its place, or the last row.
          </>,
          <>
            <strong>Results are read out.</strong> Give an action <C>announce</C> and the Group reads it through a polite status region.
          </>,
          <>
            <strong>Name the item.</strong> Put it in each action's label, like <C>aria-label="Archive invoice 1042"</C>, so a list of Archive buttons can be told apart.
          </>,
        ]}
      />
    </>
  ),
};
