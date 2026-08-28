import { useSyncExternalStore } from 'react';
import { getTheme, subscribe, type Theme } from '#/lib/theme.ts';

export const useTheme = (): Theme => {
  return useSyncExternalStore(subscribe, getTheme, () => 'system');
};
