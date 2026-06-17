import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Addresses, Address, Args, AddressInput } from './types';
import { GraphQLError } from 'graphql';

const addressesFile = path.join(__dirname, '../../../data/addresses.json');

const readAddresses = (): Addresses => {
  const file = readFileSync(addressesFile, 'utf-8');
  return JSON.parse(file) as Addresses;
};

const writeAddresses = (addresses: Addresses) => {
  writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
};

const _getAddress = (username: string): Address | null => {
  const addresses = readAddresses();
  return addresses[username] ?? null;
};

export const getAddress = (_: any, args: Args, context: any): Address => {
  context.logger.info('getAddress', 'Enter resolver');
  const address = _getAddress(args.username);
  if (address) {
    context.logger.info('getAddress', 'Returning address');
    return address;
  }
  context.logger.error('getAddress', 'No address found');
  throw new GraphQLError('No address found in getAddress resolver');
};

export const createAddress = (_: any, args: { username: string; address: AddressInput }, context: any): Address => {
  context.logger.info('createAddress', 'Enter resolver');
  const { username, address } = args;
  const addresses = readAddresses();

  if (addresses[username]) {
    context.logger.error('createAddress', 'Address already exists');
    throw new GraphQLError('Address already exists');
  }

  addresses[username] = address;
  writeAddresses(addresses);
  context.logger.info('createAddress', 'Saved address');
  return address;
};
