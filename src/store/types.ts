/**
 * Simple counter store example for Zustand demonstration
 */

export interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}
