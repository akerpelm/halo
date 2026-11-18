import { createContext, useContext } from 'react';

export type SwipeGroupContextValue = {
  /** Close whichever row was open before this one. */
  claim: (close: () => void) => void;
  announce: (message: string) => void;
};

export const SwipeGroupContext = createContext<SwipeGroupContextValue | null>(null);

export const useSwipeGroupContext = () => useContext(SwipeGroupContext);
