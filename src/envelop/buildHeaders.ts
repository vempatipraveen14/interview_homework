import type { Plugin } from '@envelop/core';
import { getOperationAST } from 'graphql';
import { ContextType } from '../types';

export const buildHeaders = (): Plugin<ContextType> => {
  return {
    onExecute({ args, context, extendContext, setResultAndStopExecution }: any) {
      const client = context?.client ?? args?.contextValue?.client ?? '';
      if (!client) {
        setResultAndStopExecution({
          errors: [
            {
              message: 'Missing required client header',
            },
          ],
        });
        return;
      }

      if (client === 'strata') {
        const operationAST = getOperationAST(args.document, args.operationName);
        if (operationAST?.operation === 'mutation') {
          setResultAndStopExecution({
            errors: [
              {
                message: 'Mutations are not allowed for client strata',
              },
            ],
          });
          return;
        }
      }

      const requestId = context?.requestId ?? args?.contextValue?.requestId;
      if (!context?.requestId && requestId) {
        extendContext({ requestId });
      }

      return {
        onExecuteDone({ args, result }: any) {
          const executionContext = args?.contextValue ?? args?.context ?? {};
          const requestId = executionContext?.requestId;

          if (!requestId) {
            return;
          }

          const appendMetadata = (executionResult: any) => {
            if (executionResult && typeof executionResult === 'object') {
              executionResult.metadata = {
                requestId,
              };
            }
          };

          if (result && typeof (result as any)[Symbol.asyncIterator] === 'function') {
            return {
              onNext({ result: executionResult }: any) {
                appendMetadata(executionResult);
              },
            };
          }

          if (result && typeof result === 'object') {
            appendMetadata(result);
          }
        },
      };
    },
  };
};
