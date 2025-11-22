import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Fetch posts
const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=5');
  return data;
};

// Fetch single post
const fetchPost = async (id: number): Promise<Post> => {
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return data;
};

// Create post
const createPost = async (newPost: Omit<Post, 'id'>): Promise<Post> => {
  const { data } = await axios.post('https://jsonplaceholder.typicode.com/posts', newPost);
  return data;
};

export default function ReactQueryExample() {
  const queryClient = useQueryClient();
  const [selectedPostId, setSelectedPostId] = React.useState<number | null>(null);

  // Query for posts list
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  // Query for single post
  const { data: selectedPost } = useQuery({
    queryKey: ['post', selectedPostId],
    queryFn: () => fetchPost(selectedPostId!),
    enabled: !!selectedPostId,
  });

  // Mutation for creating post
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleCreatePost = () => {
    createPostMutation.mutate({
      title: 'New Post',
      body: 'This is a new post created with React Query!',
      userId: 1,
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>React Query Example</h1>

      {/* Create Post Section */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f0f0f0',
          borderRadius: '8px',
        }}
      >
        <h2>Create Post</h2>
        <button
          onClick={handleCreatePost}
          disabled={createPostMutation.isPending}
          style={{
            padding: '0.75rem 1.5rem',
            background: createPostMutation.isPending ? '#999' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: createPostMutation.isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {createPostMutation.isPending ? 'Creating...' : 'Create New Post'}
        </button>
        {createPostMutation.isSuccess && (
          <p style={{ color: 'green', marginTop: '0.5rem' }}>✅ Post created successfully!</p>
        )}
        {createPostMutation.isError && (
          <p style={{ color: 'red', marginTop: '0.5rem' }}>❌ Error creating post</p>
        )}
      </div>

      {/* Posts List */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Posts</h2>
        {isLoading && <p>Loading posts...</p>}
        {error && <p style={{ color: 'red' }}>Error loading posts</p>}
        {posts && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                style={{
                  padding: '1rem',
                  background: selectedPostId === post.id ? '#e3f2fd' : '#f9f9f9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedPostId === post.id ? '2px solid #007bff' : '1px solid #ddd',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{post.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {post.body.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Post Detail */}
      {selectedPost && (
        <div style={{ padding: '1.5rem', background: '#fff3cd', borderRadius: '8px' }}>
          <h2>Selected Post Details</h2>
          <h3>{selectedPost.title}</h3>
          <p>{selectedPost.body}</p>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>User ID: {selectedPost.userId}</p>
        </div>
      )}

      {/* Features Info */}
      <div
        style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}
      >
        <h3 style={{ marginTop: 0 }}>React Query Features Demonstrated:</h3>
        <ul style={{ margin: '0.5rem 0' }}>
          <li>
            <strong>useQuery:</strong> Fetch and cache data automatically
          </li>
          <li>
            <strong>useMutation:</strong> Create/update data with optimistic updates
          </li>
          <li>
            <strong>Query Invalidation:</strong> Refetch data after mutations
          </li>
          <li>
            <strong>Enabled Queries:</strong> Conditional data fetching
          </li>
          <li>
            <strong>Loading & Error States:</strong> Built-in state management
          </li>
          <li>
            <strong>DevTools:</strong> Open React Query DevTools (bottom-left icon)
          </li>
        </ul>
      </div>
    </div>
  );
}
