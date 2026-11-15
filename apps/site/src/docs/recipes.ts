import { LLMS_URL } from '../lib/site';

export const recipes: ReadonlyArray<{ id: string; title: string; when: string; prompt: () => string }> = [
  {
    id: 'recipe-toasts',
    title: 'Add toasts',
    when: 'A new app, or one with no notification system yet.',
    prompt: () => `Add Halo toasts to this React app. Read ${LLMS_URL} first.
1. npm i halo-ui-react, and import 'halo-ui-react/styles.css' once in the root layout or entry file.
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
- Change imports from 'sonner' to 'halo-ui-react/toast', and add import 'halo-ui-react/styles.css' once.
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
- Change imports from 'vaul' to 'halo-ui-react/drawer'.
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

export function recipePrompt(id: string): string {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) throw new Error(`No recipe ${id}`);
  return recipe.prompt();
}
