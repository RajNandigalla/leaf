import { renderHook, act } from '@testing-library/react';
import { useCounterStore } from '../counterStore';

describe('CounterStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCounterStore.getState().reset();
  });

  it('should have initial count of 0', () => {
    const { result } = renderHook(() => useCounterStore());
    expect(result.current.count).toBe(0);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounterStore());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounterStore());

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(-1);
  });

  it('should reset count to 0', () => {
    const { result } = renderHook(() => useCounterStore());

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(3);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });
});
