let locks = 0;
let savedOverflow = '';
let savedPadding = '';

export function lockScroll(): () => void {
  const root = document.documentElement;
  if (locks === 0) {
    const scrollbar = window.innerWidth - root.clientWidth;
    savedOverflow = root.style.overflow;
    savedPadding = root.style.paddingRight;
    root.style.overflow = 'hidden';
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
  }
  locks += 1;
  return () => {
    locks -= 1;
    if (locks > 0) return;
    root.style.overflow = savedOverflow;
    root.style.paddingRight = savedPadding;
  };
}
