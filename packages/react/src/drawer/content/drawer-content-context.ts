import { type RefObject, createContext, useContext } from 'react';

export type DrawerContentContextValue = {
  stepSnap: (direction: 1 | -1) => void;
  wasDragged: RefObject<boolean>;
};

export const DrawerContentContext = createContext<DrawerContentContextValue | null>(null);

export const useDrawerContentContext = () => useContext(DrawerContentContext);
