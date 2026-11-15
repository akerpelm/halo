import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { preloadSurface } from '../lib/lazy-surfaces';
import { navigate } from '../lib/router';

export function Link({ href = '', onClick, onPointerEnter, onFocus, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const internal = href.startsWith('/') && !href.startsWith('//') && !/\.(txt|md|xml)$/.test(href);
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
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (internal) preloadSurface(href);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (internal) preloadSurface(href);
      }}
      {...props}
    />
  );
}
