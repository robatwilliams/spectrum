//@flow
import { request } from '../../utils';
import db from 'shared/testing/db';
import data from 'shared/testing/data';

// various permissions for Spectrum community
const user = data.users.find(({ username }) => username === 'mxstbr');

afterEach(async () => {
  await db
    .table('communities')
    .filter({ slug: 'test-community' })
    .delete()
    .run();
});

const variables = {
  input: {
    name: 'test community',
    slug: 'test-community',
    description: 'test description',
  },
};

const denyListed = {
  input: {
    ...variables.input,
    slug: 'api',
  },
};

const noslug = {
  input: {
    ...variables.input,
    slug: '',
  },
};

it('should create a community', async () => {
  const query = /* GraphQL */ `
    mutation createCommunity($input: CreateCommunityInput!) {
      createCommunity(input: $input) {
        name
        slug
        description
      }
    }
  `;

  const context = { user };

  expect.assertions(5);

  const result = await request(query, { context, variables });
  
  expect(result.errors).toBeUndefined();
  expect(result.data.createCommunity).toBeDefined();
  expect(result.data.createCommunity.name).toBe(variables.input.name);
  expect(result.data.createCommunity.slug).toBe(variables.input.slug);
  expect(result.data.createCommunity.description).toBe(variables.input.description);
});

it('should prevent denyListed community slug', async () => {
  const query = /* GraphQL */ `
    mutation createCommunity($input: CreateCommunityInput!) {
      createCommunity(input: $input) {
        name
        slug
        description
      }
    }
  `;

  const context = { user };

  expect.assertions(3);

  const result = await request(query, { context, variables: denyListed });
  
  expect(result.data.createCommunity).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/not available/i);
});

it('should prevent signed out users from creating a community', async () => {
  const query = /* GraphQL */ `
    mutation createCommunity($input: CreateCommunityInput!) {
      createCommunity(input: $input) {
        name
        slug
        description
      }
    }
  `;

  const context = {};

  expect.assertions(3);

  const result = await request(query, { context, variables: denyListed });
  
  expect(result.data.createCommunity).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/signed in/i);
});

it('should prevent a community being created without a slug', async () => {
  const query = /* GraphQL */ `
    mutation createCommunity($input: CreateCommunityInput!) {
      createCommunity(input: $input) {
        name
        slug
        description
      }
    }
  `;

  const context = { user };

  expect.assertions(3);

  const result = await request(query, { context, variables: noslug });
  
  expect(result.data.createCommunity).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toBeDefined();
});
