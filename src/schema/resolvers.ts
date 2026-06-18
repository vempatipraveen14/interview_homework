import { getAddress, createAddress } from './address/address';
import { nearEarthObjectsResolver } from './neo/neo';
import { Address, Args, CreateAddressArgs } from './address/types';

export const resolvers = {
  Query: {
    address: (parent: any, args: Args, context: any): Address => {
      return getAddress(parent, args, context);
    },
    nearEarthObjects: nearEarthObjectsResolver,
  },
  Mutation: {
    createAddress: (parent: any, args: CreateAddressArgs, context: any): Address => {
      return createAddress(parent, args, context);
    },
  },
};
