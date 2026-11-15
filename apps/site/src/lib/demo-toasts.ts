import { toast } from '@halo-ui/react/toast';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** The site's demo toasts. Pass a toaster id to send them to a specific <Toaster>. */
export function createDemos(toasterId?: string) {
  const on = { toasterId };
  const demos = {
  default: (from?: Element) => toast('Draft saved', { ...on, from, description: 'Last edit 2 seconds ago' }),
  success: (from?: Element) => toast.success('Invite sent', { ...on, from, description: 'mara@studio.example will get an email shortly' }),
  error: (from?: Element) =>
    toast.error('Upload failed', {
      ...on,
      from,
      description: 'The file is over the 20 MB limit',
      action: { label: 'Retry', onClick: () => demos.promise() },
    }),
  warning: (from?: Element) => toast.warning('Storage almost full', { ...on, from, description: '92% of 10 GB used' }),
  info: (from?: Element) => toast.info('New version available', { ...on, from, action: { label: 'Reload', onClick: () => undefined } }),
  promise: (from?: Element) =>
    toast.promise(wait(1800), {
      loading: 'Publishing changes…',
      success: 'Published',
      error: 'Could not publish',
    }, { ...on, from }),
  update: (from?: Element) => {
    const id = toast.loading('Exporting 0 of 3 files', { ...on, from });
    let done = 0;
    const tick = window.setInterval(() => {
      done += 1;
      if (done < 3) {
        toast.update(id, `Exporting ${done} of 3 files`, on);
        return;
      }
      window.clearInterval(tick);
      toast.update(id, 'Export ready', { ...on, from, type: 'success', description: 'project-assets.zip · 14.2 MB' });
    }, 900);
  },
  long: (from?: Element) =>
    toast('Comment from Ines', {
      ...on,
      from,
      description:
        'I moved the onboarding copy into the shared doc and left notes on the two screens that still use the old pricing table. Can you take a look before Thursday?',
    }),
  };
  return {
    ...demos,
    /** Re-send the success demo into an existing toast: same content, fresh clock, no entrance. */
    refresh: (id: string | number) =>
      toast.update(id, 'Invite sent', { ...on, type: 'success', description: 'mara@studio.example will get an email shortly' }),
  };
}

export const demos = createDemos();
export const playgroundDemos = createDemos('playground');

const sequence = [demos.success, demos.promise, demos.error, demos.default, demos.update, demos.info];
let next = 0;

/** The hero button walks through the toast types, launching each one out of the button itself. */
export function fireNextDemo(from?: Element) {
  const demo = sequence[next % sequence.length];
  next += 1;
  demo?.(from);
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** A stand-in for a model streaming a reply, word by word. */
async function* reply() {
  const text = 'Ines moved the onboarding copy into the shared doc and flagged two screens that still use the old pricing table.';
  for (const word of text.split(' ')) {
    await sleep(55 + Math.random() * 70);
    yield `${word} `;
  }
}

/** The toast types only Halo has. */
export const newDemos = {
  launch: (from: Element) => toast.success('Saved', { from, description: 'It flew out of the button you pressed.' }),
  stream: () => toast.stream(reply(), { title: 'Summarising the thread…', success: 'Thread summary' }),
  undo: () => toast.undo('Conversation archived', { onUndo: () => toast('Conversation restored') }),
  group: () => toast.success('File uploaded', { group: 'uploads', description: 'Press again: repeats count up instead of stacking.' }),
};
