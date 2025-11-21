import { useEffect, useState } from 'react';
import Head from 'next/head';
import api from '@/lib/axios';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

// GraphQL Query
const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`;

interface Post {
  id: number;
  title: string;
}

interface Location {
  id: string;
  name: string;
  description: string;
}

export default function Home() {
  // Axios State
  const [posts, setPosts] = useState<Post[]>([]);
  const [axiosLoading, setAxiosLoading] = useState(true);

  // Apollo State
  const {
    loading: gqlLoading,
    error: gqlError,
    data: gqlData,
  } = useQuery<{ locations: Location[] }>(GET_LOCATIONS);

  // Fetch with Axios
  useEffect(() => {
    api
      .get('/posts?_limit=5')
      .then((response) => {
        setPosts(response.data);
        setAxiosLoading(false);
      })
      .catch((error) => {
        console.error('Axios Error:', error);
        setAxiosLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900 font-sans">
      <Head>
        <title>LeafInk</title>
      </Head>
      <h1 className="text-4xl font-bold text-center mb-12 text-blue-600">Setup Verification</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Axios Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600 flex items-center">
            <span className="mr-2">🚀</span> Axios (REST)
          </h2>
          {axiosLoading ? (
            <p className="text-gray-500 animate-pulse">Loading posts...</p>
          ) : (
            <ul className="space-y-3">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-700">#{post.id}</span> {post.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Apollo Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4 text-pink-600 flex items-center">
            <span className="mr-2">⚛️</span> Apollo (GraphQL)
          </h2>
          {gqlLoading ? (
            <p className="text-gray-500 animate-pulse">Loading locations...</p>
          ) : gqlError ? (
            <p className="text-red-500">Error: {gqlError.message}</p>
          ) : (
            <ul className="space-y-3">
              {gqlData?.locations.map((location: Location) => (
                <li
                  key={location.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="font-bold text-gray-800">{location.name}</div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {location.description}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
