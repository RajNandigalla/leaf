import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CounterState } from './types';

/**
 * Simple counter store example
 * Demonstrates Zustand with persist and devtools middleware
 */
export const useCounterStore = create<CounterState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        reset: () => set({ count: 0 }),
      }),
      {
        name: 'counter-storage',
      }
    ),
    {
      name: 'CounterStore',
    }
  )
);
