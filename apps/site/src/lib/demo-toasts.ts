import { toast } from '@halo-ui/react/toast';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const demos = {
  default: () => toast('Draft saved', { description: 'Last edit 2 seconds ago' }),
  success: () => toast.success('Invite sent', { description: 'mara@studio.example will get an email shortly' }),
  error: () =>
    toast.error('Upload failed', {
      description: 'The file is over the 20 MB limit',
      action: { label: 'Retry', onClick: () => demos.promise() },
    }),
  warning: () => toast.warning('Storage almost full', { description: '92% of 10 GB used' }),
  info: () => toast.info('New version available', { action: { label: 'Reload', onClick: () => undefined } }),
  promise: () =>
    toast.promise(wait(1800), {
      loading: 'Publishing changes…',
      success: 'Published',
      error: 'Could not publish',
    }),
  update: () => {
    const id = toast.loading('Exporting 0 of 3 files');
    let done = 0;
    const tick = window.setInterval(() => {
      done += 1;
      if (done < 3) {
        toast.update(id, `Exporting ${done} of 3 files`);
        return;
      }
      window.clearInterval(tick);
      toast.update(id, 'Export ready', { type: 'success', duration: 5000, description: 'project-assets.zip · 14.2 MB' });
    }, 900);
  },
  long: () =>
    toast('Comment from Ines', {
      description:
        'I moved the onboarding copy into the shared doc and left notes on the two screens that still use the old pricing table. Can you take a look before Thursday?',
    }),
};

const sequence = [demos.success, demos.promise, demos.error, demos.default, demos.update, demos.info];
let next = 0;

/** The hero button walks through the toast types so repeated presses show the range. */
export function fireNextDemo() {
  const demo = sequence[next % sequence.length];
  next += 1;
  demo?.();
}
