//@flow
import { request } from '../../utils';
import db from 'shared/testing/db';
import data from 'shared/testing/data';
import { SPECTRUM_COMMUNITY_ID } from '../../../migrations/seed/default/constants';

// various permissions for Spectrum community
const owner = data.users.find(({ username }) => username === 'mxstbr');
const moderator = data.users.find(({ username }) => username === 'brian');
const noPermissionUser = data.users.find(({ username }) => username === 'bryn');

afterEach(async () => {
  await db
    .table('channels')
    .filter({ slug: 'test-channel' })
    .delete()
    .run();
});

const variables = {
  input: {
    name: 'test channel',
    slug: 'test-channel',
    description: 'test description',
    isPrivate: false,
    isDefault: false,
    communityId: SPECTRUM_COMMUNITY_ID,
  },
};

it('should create a channel if user is owner', async () => {
  const query = /* GraphQL */ `
    mutation createChannel($input: CreateChannelInput!) {
      createChannel (input: $input) {
        name
        slug
        description
        isPrivate
      }
    },
  `;

  const context = {
    user: owner,
  };

  expect.assertions(6);

  const result = await request(query, { context, variables });
  
  expect(result.errors).toBeUndefined();
  expect(result.data.createChannel.name).toBe(variables.input.name);
  expect(result.data.createChannel.slug).toBe(variables.input.slug);
  expect(result.data.createChannel.description).toBe(variables.input.description);
  expect(result.data.createChannel.isPrivate).toBe(variables.input.isPrivate);
  
  // Verify channel was created in database
  const createdChannel = await db
    .table('channels')
    .filter({ slug: 'test-channel' })
    .run();
  expect(createdChannel).toHaveLength(1);
});

it('should prevent duplicate channel slugs in the same community', async () => {
  const query = /* GraphQL */ `
    mutation createChannel($input: CreateChannelInput!) {
      createChannel (input: $input) {
        id
        name
        slug
        description
        isPrivate
        createdAt
      }
    },
  `;

  const context = {
    user: owner,
  };

  expect.assertions(3);
  const result = await request(query, {
    context,
    variables: {
      input: {
        ...variables.input,
        slug: 'general',
      },
    },
  });

  expect(result.data.createChannel).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/already exists/i);
});

it('should prevent signed out users from creating a channel', async () => {
  const query = /* GraphQL */ `
    mutation createChannel($input: CreateChannelInput!) {
      createChannel (input: $input) {
        id
        name
        slug
        description
        isPrivate
        createdAt
      }
    },
  `;

  const context = {
    user: null,
  };

  expect.assertions(3);
  const result = await request(query, { context, variables });

  expect(result.data.createChannel).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/signed in/i);
});

it('should prevent non owners from creating a channel', async () => {
  const query = /* GraphQL */ `
    mutation createChannel($input: CreateChannelInput!) {
      createChannel (input: $input) {
        id
        name
        slug
        description
        isPrivate
        createdAt
      }
    },
  `;

  const context = {
    user: noPermissionUser,
  };

  expect.assertions(3);
  const result = await request(query, { context, variables });

  expect(result.data.createChannel).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/permission/i);
});

it('should prevent moderators from creating a channel', async () => {
  const query = /* GraphQL */ `
    mutation createChannel($input: CreateChannelInput!) {
      createChannel (input: $input) {
        id
        name
        slug
        description
        isPrivate
        createdAt
      }
    },
  `;

  const context = {
    user: moderator,
  };

  expect.assertions(3);
  const result = await request(query, { context, variables });

  expect(result.data.createChannel).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/permission/i);
});
