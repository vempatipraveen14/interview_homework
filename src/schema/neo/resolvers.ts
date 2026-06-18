import { nearEarthObjectsResolver } from './neo';

export const resolvers = {
  Query: {
    nearEarthObjects: nearEarthObjectsResolver,
  },
};
