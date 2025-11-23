import { useState } from 'react';
import { produce } from 'immer';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function ImmerExample() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn Immer', completed: false },
    { id: 2, text: 'Build awesome apps', completed: false },
  ]);

  // Using Immer for immutable updates
  const toggleTodo = (id: number) => {
    setTodos(
      produce((draft) => {
        const todo = draft.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      })
    );
  };

  const addTodo = () => {
    const text = prompt('Enter todo text:');
    if (!text) return;

    setTodos(
      produce((draft) => {
        draft.push({
          id: Date.now(),
          text,
          completed: false,
        });
      })
    );
  };

  const removeTodo = (id: number) => {
    setTodos(
      produce((draft) => {
        const index = draft.findIndex((t) => t.id === id);
        if (index !== -1) {
          draft.splice(index, 1);
        }
      })
    );
  };

  // Without Immer (for comparison - kept for documentation)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _toggleTodoWithoutImmer = (id: number) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Immer Example</h1>

      <button
        onClick={addTodo}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        Add Todo
      </button>

      <div style={{ marginBottom: '2rem' }}>
        {todos.map((todo) => (
          <div
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              background: '#f9f9f9',
              borderRadius: '4px',
              marginBottom: '0.5rem',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#999' : '#000',
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => removeTodo(todo.id)}
              style={{
                padding: '0.5rem 1rem',
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Immer Benefits:</h3>
        <div style={{ marginBottom: '1rem' }}>
          <h4>With Immer:</h4>
          <pre
            style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}
          >
            {`setTodos(produce((draft) => {
  const todo = draft.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
}));`}
          </pre>
        </div>
        <div>
          <h4>Without Immer:</h4>
          <pre
            style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}
          >
            {`setTodos(
  todos.map(todo =>
    todo.id === id
      ? { ...todo, completed: !todo.completed }
      : todo
  )
);`}
          </pre>
        </div>
        <ul style={{ marginTop: '1rem' }}>
          <li>Write simpler, more readable code</li>
          <li>Mutate drafts directly (Immer handles immutability)</li>
          <li>Reduce boilerplate for nested updates</li>
          <li>TypeScript-friendly</li>
        </ul>
      </div>
    </div>
  );
}
