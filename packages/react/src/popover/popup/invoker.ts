/** Make the trigger the popup's native invoker, so the browser keeps Esc, light dismiss, tab order and focus return in step. */
export function wireInvoker(trigger: HTMLButtonElement | null, popup: HTMLDivElement | null) {
  if (trigger && popup && 'popoverTargetElement' in trigger) trigger.popoverTargetElement = popup;
}
