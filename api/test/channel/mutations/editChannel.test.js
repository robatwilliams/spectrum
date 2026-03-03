//@flow
import { request } from '../../utils';
import db from 'shared/testing/db';
import data from 'shared/testing/data';

const channel = data.channels[0];
// various permissions for Spectrum community
const owner = data.users.find(({ username }) => username === 'mxstbr');
const noPermissionUser = data.users.find(({ username }) => username === 'bryn');

afterEach(async () => {
  await db
    .table('channels')
    .filter({ slug: channel.slug })
    .update({ ...channel })
    .run();
});

const variables = {
  input: {
    name: 'edited name',
    slug: 'edited-slug',
    description: 'edited description',
    isPrivate: false,
    channelId: channel.id,
  },
};

it('should edit a channel if user is owner', async () => {
  const query = /* GraphQL */ `
    mutation editChannel($input: EditChannelInput!) {
      editChannel(input: $input) {
        name
        slug
        description
        isPrivate
      }
    }
  `;

  const context = {
    user: owner,
  };

  expect.assertions(6);

  const result = await request(query, { context, variables });

  expect(result.errors).toBeUndefined();
  expect(result.data.editChannel).toBeDefined();
  expect(result.data.editChannel.name).toBe(variables.input.name);
  expect(result.data.editChannel.slug).toBe(variables.input.slug);
  expect(result.data.editChannel.description).toBe(variables.input.description);
  expect(result.data.editChannel.isPrivate).toBe(variables.input.isPrivate);
});

it('should not edit a channel if user is not owner', async () => {
  const query = /* GraphQL */ `
    mutation editChannel($input: EditChannelInput!) {
      editChannel(input: $input) {
        name
        slug
        description
        isPrivate
      }
    }
  `;

  const context = {
    user: noPermissionUser,
  };

  expect.assertions(3);

  const result = await request(query, { context, variables });

  expect(result.data.editChannel).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/permission/i);
});

it('should not edit a channel if user is not signed in', async () => {
  const query = /* GraphQL */ `
    mutation editChannel($input: EditChannelInput!) {
      editChannel(input: $input) {
        name
        slug
        description
        isPrivate
      }
    }
  `;

  expect.assertions(3);

  const result = await request(query, { variables });

  expect(result.data.editChannel).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toBeDefined();
});
