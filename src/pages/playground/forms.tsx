import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for form validation
const userSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type UserFormData = z.infer<typeof userSchema>;

export default function FormsExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Form submitted:', data);
    alert('Form submitted successfully! Check console for data.');
    reset();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>React Hook Form + Zod Example</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <label
            htmlFor="name"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Name
          </label>
          <input
            id="name"
            {...register('name')}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: errors.name ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.name && (
            <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: errors.email ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.email && (
            <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="age"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Age
          </label>
          <input
            id="age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: errors.age ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.age && (
            <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.age.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: errors.password ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.password && (
            <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: errors.confirmPassword ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.confirmPassword && (
            <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#fff',
            background: isSubmitting ? '#999' : '#007bff',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '1rem',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      <div
        style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}
      >
        <h3 style={{ marginTop: 0 }}>Features Demonstrated:</h3>
        <ul style={{ margin: '0.5rem 0' }}>
          <li>
            <strong>Zod Schema:</strong> Type-safe validation with custom rules
          </li>
          <li>
            <strong>React Hook Form:</strong> Performant form state management
          </li>
          <li>
            <strong>Error Handling:</strong> Real-time validation feedback
          </li>
          <li>
            <strong>TypeScript:</strong> Full type inference from Zod schema
          </li>
          <li>
            <strong>Custom Validation:</strong> Password confirmation check
          </li>
        </ul>
      </div>
    </div>
  );
}
