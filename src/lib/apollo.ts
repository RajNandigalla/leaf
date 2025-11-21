import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://flyby-router-demo.herokuapp.com/',
  }),
  cache: new InMemoryCache(),
});

export default client;
