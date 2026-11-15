import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from '../lib/router';

/** An anchor that navigates in place for in-site URLs and behaves normally for everything else. */
export function Link({ href = '', onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const internal = href.startsWith('/') && !href.startsWith('//') && !href.endsWith('.txt');
  return (
    <a
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
        if (!internal || modified || event.defaultPrevented) return;
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    />
  );
}
