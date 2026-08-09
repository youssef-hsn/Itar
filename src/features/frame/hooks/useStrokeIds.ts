import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useState } from 'react';

let counter = 0;

const nextId = () => {
  counter += 1;
  return `stroke-${counter}`;
};

const resize = (ids: string[], length: number): string[] => {
  if (ids.length === length) {
    return ids;
  }
  if (ids.length > length) {
    return ids.slice(0, length);
  }
  return [...ids, ...Array.from({ length: length - ids.length }, nextId)];
};

export const useStrokeIds = (length: number) => {
  const [ids, setIds] = useState<string[]>(() => resize([], length));
  const [syncedLength, setSyncedLength] = useState(length);

  if (syncedLength !== length) {
    setSyncedLength(length);
    setIds((current) => resize(current, length));
  }

  const reorderIds = useCallback((fromIndex: number, toIndex: number) => {
    setIds((current) => arrayMove(current, fromIndex, toIndex));
  }, []);

  const removeId = useCallback((index: number) => {
    setIds((current) => current.filter((_, i) => i !== index));
  }, []);

  return { ids, reorderIds, removeId };
};
