import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import api from '@/lib/axios';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`;

export default function MocksTest() {
  const [restUsers, setRestUsers] = useState<unknown[]>([]);
  const { data: gqlData, loading: gqlLoading, error: gqlError } = useQuery(GET_USERS);

  useEffect(() => {
    api.get('https://jsonplaceholder.typicode.com/users').then((res) => {
      setRestUsers(res.data);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Mocking Test</h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">REST (Faker)</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(restUsers, null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">GraphQL (Faker)</h2>
          {gqlLoading && <p>Loading GraphQL...</p>}
          {gqlError && <p className="text-red-500">Error: {gqlError.message}</p>}
          {gqlData ? (
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(gqlData, null, 2)}</pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}
