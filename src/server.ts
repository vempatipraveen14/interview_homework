import { createServer } from 'node:http';
import { genSchema } from './schema';
import { createYoga } from 'graphql-yoga';
import { GraphQLError } from 'graphql';
import { v4 as uuid } from 'uuid';
import plugins from './envelop';

const yogaPort = 4000;

// Simple NASA API wrapper using built-in fetch
const nasaApiWrapper = async (startDate: string, endDate: string) => {
  const response = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=DEMO_KEY`
  );
  if (!response.ok) {
    throw new Error(`NASA API error: ${response.statusText}`);
  }
  return response.json();
};

(() => {
  const schema = genSchema();
  const yoga = createYoga({
    schema,
    plugins: plugins,
    context: async (initialContext) => {
      const client = initialContext.request.headers.get('client');
      if (!client) {
        throw new GraphQLError('Missing required client header');
      }
      return {
        requestId: uuid(),
        client,
        // Provide NASA API wrapper through context for resolvers to use
        nasaApi: nasaApiWrapper,
      };
    },
  });
  const server = createServer(yoga);

  server.listen(yogaPort, () => {
    console.log(`Server is listening at http://localhost:${yogaPort}/graphql`);
  });
})();
