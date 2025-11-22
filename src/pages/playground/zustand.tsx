import React from 'react';
import { useCounterStore } from '@/store';

/**
 * Simple Zustand example demonstrating:
 * - Basic state management
 * - Actions (increment, decrement, reset)
 * - Persist middleware (localStorage)
 * - DevTools integration
 */
export default function ZustandExample() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Zustand Counter Example</h1>

      <div
        style={{
          fontSize: '4rem',
          textAlign: 'center',
          margin: '2rem 0',
          fontWeight: 'bold',
        }}
      >
        {count}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={decrement}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.25rem',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '2px solid #333',
            background: '#fff',
          }}
        >
          -
        </button>
        <button
          onClick={increment}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.25rem',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '2px solid #333',
            background: '#fff',
          }}
        >
          +
        </button>
        <button
          onClick={reset}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '2px solid #666',
            background: '#f5f5f5',
          }}
        >
          Reset
        </button>
      </div>

      <div
        style={{
          background: '#f0f0f0',
          padding: '1.5rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Features Demonstrated:</h3>
        <ul style={{ margin: '0.5rem 0' }}>
          <li>
            <strong>State Management:</strong> Counter value persisted in Zustand store
          </li>
          <li>
            <strong>Actions:</strong> increment(), decrement(), reset()
          </li>
          <li>
            <strong>Persist Middleware:</strong> Value saved to localStorage (refresh to test)
          </li>
          <li>
            <strong>DevTools:</strong> Open Redux DevTools to see state changes
          </li>
        </ul>
      </div>
    </div>
  );
}
