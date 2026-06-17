import { createServer } from 'node:http';
import { genSchema } from './schema';
import { createYoga } from 'graphql-yoga';
import { GraphQLError } from 'graphql';
import { v4 as uuid } from 'uuid';
import plugins from './envelop';

const yogaPort = 4000;

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
      };
    },
  });
  const server = createServer(yoga);

  server.listen(yogaPort, () => {
    console.log(`Server is listening at http://localhost:${yogaPort}/graphql`);
  });
})();
