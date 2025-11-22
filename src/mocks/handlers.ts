import { http, graphql, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

export const handlers = [
  // REST Handler
  http.get('https://jsonplaceholder.typicode.com/users', () => {
    return HttpResponse.json([
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    ]);
  }),

  // GraphQL Handler
  graphql.query('GetUsers', () => {
    return HttpResponse.json({
      data: {
        users: [
          {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
          },
        ],
      },
    });
  }),
];
