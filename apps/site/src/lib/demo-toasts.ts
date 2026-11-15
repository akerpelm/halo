import { toast } from '@halo-ui/react/toast';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** The site's demo toasts. Pass a toaster id to send them to a specific <Toaster>. */
export function createDemos(toasterId?: string) {
  const on = { toasterId };
  const demos = {
  default: () => toast('Draft saved', { ...on, description: 'Last edit 2 seconds ago' }),
  success: () => toast.success('Invite sent', { ...on, description: 'mara@studio.example will get an email shortly' }),
  error: () =>
    toast.error('Upload failed', {
      ...on,
      description: 'The file is over the 20 MB limit',
      action: { label: 'Retry', onClick: () => demos.promise() },
    }),
  warning: () => toast.warning('Storage almost full', { ...on, description: '92% of 10 GB used' }),
  info: () => toast.info('New version available', { ...on, action: { label: 'Reload', onClick: () => undefined } }),
  promise: () =>
    toast.promise(wait(1800), {
      loading: 'Publishing changes…',
      success: 'Published',
      error: 'Could not publish',
    }, on),
  update: () => {
    const id = toast.loading('Exporting 0 of 3 files', on);
    let done = 0;
    const tick = window.setInterval(() => {
      done += 1;
      if (done < 3) {
        toast.update(id, `Exporting ${done} of 3 files`, on);
        return;
      }
      window.clearInterval(tick);
      toast.update(id, 'Export ready', { ...on, type: 'success', duration: 5000, description: 'project-assets.zip · 14.2 MB' });
    }, 900);
  },
  long: () =>
    toast('Comment from Ines', {
      ...on,
      description:
        'I moved the onboarding copy into the shared doc and left notes on the two screens that still use the old pricing table. Can you take a look before Thursday?',
    }),
  };
  return demos;
}

export const demos = createDemos();
export const playgroundDemos = createDemos('playground');

const sequence = [demos.success, demos.promise, demos.error, demos.default, demos.update, demos.info];
let next = 0;

/** The hero button walks through the toast types so repeated presses show the range. */
export function fireNextDemo() {
  const demo = sequence[next % sequence.length];
  next += 1;
  demo?.();
}
