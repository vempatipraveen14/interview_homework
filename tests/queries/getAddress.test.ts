import { parse } from 'graphql';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { executor, executorWithoutHeaders, executorStrata } from '../exectuor';

const addressesFile = path.join(__dirname, '../../data/addresses.json');

const readAddresses = () => JSON.parse(readFileSync(addressesFile, 'utf-8'));
const writeAddresses = (addresses: any) => writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));

describe('getAddress', () => {
  test('Success', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const variables = { username: 'jack' };

    const result = await executor({
      document: parse(query),
      variables,
    });

    expect(result).toEqual({
      data: {
        address: {
          street: '123 Street St.',
          city: 'Sometown',
          zipcode: '43215',
        },
      },
      metadata: {
        requestId: 'test-request-id',
      },
    });
  });

  test('Error', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const variables = { username: 'john' };

    const result = await executor({
      document: parse(query),
      variables,
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'No address found in getAddress resolver',
          }),
        ]),
      })
    );
  });

  test('Missing client header rejects request', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                }
            }
        `;

    const variables = { username: 'jack' };

    const result = await executorWithoutHeaders({
      document: parse(query),
      variables,
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Missing required client header',
          }),
        ]),
      })
    );
  });

  test('Strata client cannot execute mutations', async () => {
    const query = `
            mutation CreateAddress($username: String!, $address: AddressInput!) {
                createAddress(username: $username, address: $address) {
                    street
                }
            }
        `;

    const variables = {
      username: 'newuser',
      address: {
        street: '1 Test Ln',
        city: 'Testville',
        zipcode: '99999',
      },
    };

    const result = await executorStrata({
      document: parse(query),
      variables,
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Mutations are not allowed for client strata',
          }),
        ]),
      })
    );
  });

  test('createAddress mutation creates a new address', async () => {
    const originalAddresses = readAddresses();
    const username = 'testuser';
    const query = `
            mutation CreateAddress($username: String!, $address: AddressInput!) {
                createAddress(username: $username, address: $address) {
                    street
                    city
                    state
                    zipcode
                }
            }
        `;

    const variables = {
      username,
      address: {
        street: '99 Test Blvd',
        city: 'Examville',
        state: 'EX',
        zipcode: '12345',
      },
    };

    try {
      const result = await executor({
        document: parse(query),
        variables,
      });

      expect(result).toEqual(
        expect.objectContaining({
          data: {
            createAddress: {
              street: '99 Test Blvd',
              city: 'Examville',
              state: 'EX',
              zipcode: '12345',
            },
          },
          metadata: {
            requestId: 'test-request-id',
          },
        })
      );

      const savedAddresses = readAddresses();
      expect(savedAddresses[username]).toEqual(variables.address);
    } finally {
      writeAddresses(originalAddresses);
    }
  });
});
