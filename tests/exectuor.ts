import { createYoga } from 'graphql-yoga';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { genSchema } from '../src/schema';
import plugins from '../src/envelop/index';

console.profile = jest.fn();
const schema = genSchema();

const baseContext = (initialContext: any) => ({
  requestId: 'test-request-id',
  client: initialContext.request.headers.get('client') ?? '',
});

const yoga = createYoga({ schema, plugins, context: baseContext });

export const executor = buildHTTPExecutor({
  fetch: yoga.fetch,
  headers: {
    client: 'test-client',
  },
});

export const executorWithoutHeaders = buildHTTPExecutor({
  fetch: yoga.fetch,
});

export const executorStrata = buildHTTPExecutor({
  fetch: yoga.fetch,
  headers: {
    client: 'strata',
  },
});
