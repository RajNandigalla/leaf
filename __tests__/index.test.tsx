import { render, screen, waitFor } from '@testing-library/react';
import Home from '../src/pages/index';
import '@testing-library/jest-dom';

// Mock Apollo Client
jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    loading: false,
    error: null,
    data: { locations: [] },
  }),
}));

// Mock Axios
jest.mock('../src/lib/axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
}));

describe('Home', () => {
  it('renders the heading', async () => {
    render(<Home />);

    const heading = screen.getByRole('heading', {
      name: /Setup Verification/i,
    });

    expect(heading).toBeInTheDocument();

    // Wait for loading to finish to avoid act warnings
    await waitFor(() => {
      expect(screen.queryByText('Loading posts...')).not.toBeInTheDocument();
    });
  });
});
