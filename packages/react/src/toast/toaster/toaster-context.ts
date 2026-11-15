import { createContext, useContext } from 'react';
import type { SpringConfig } from '../../spring/spring-config';
import type { ToastRecord } from '../store/toast-store';
import type { ToastClassNames, ToastIntent, ToastMotion, ToastTimer } from '../types';

export type StackEdge = 1 | -1;

export type ToasterContextValue = {
  edge: StackEdge;
  horizontal: 'left' | 'center' | 'right';
  peek: number;
  config: SpringConfig;
  reducedMotion: boolean;
  closeButton: boolean;
  timer: ToastTimer;
  motion: ToastMotion;
  icons: boolean;
  intent: ToastIntent;
  classNames: ToastClassNames | undefined;
  reportHeight: (id: ToastRecord['id'], height: number) => void;
  remove: (id: ToastRecord['id']) => void;
  setInteracting: (interacting: boolean) => void;
  announce: (message: string, important: boolean) => void;
  restoreFocus: () => void;
};

export const ToasterContext = createContext<ToasterContextValue | null>(null);

export function useToasterContext(): ToasterContextValue {
  const context = useContext(ToasterContext);
  if (!context) throw new Error('A toast must be rendered inside <Toaster>.');
  return context;
}
