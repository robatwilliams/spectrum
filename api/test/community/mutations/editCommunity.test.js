//@flow
import { request } from '../../utils';
import db from 'shared/testing/db';
import data from 'shared/testing/data';

// various permissions for Spectrum community
const community = data.communities[0];
const owner = data.users.find(({ username }) => username === 'mxstbr');
const member = data.users.find(({ username }) => username === 'bryn');

afterEach(async () => {
  await db
    .table('communities')
    .filter({ slug: 'spectrum' })
    .update({
      name: community.name,
      description: community.description,
    })
    .run();
});

const variables = {
  input: {
    name: 'new name',
    description: 'new description',
    communityId: community.id,
  },
};

it('should edit a community name and description', async () => {
  const query = /* GraphQL */ `
    mutation editCommunity($input: EditCommunityInput!) {
      editCommunity (input: $input) {
        name
        description
      }
    },
  `;

  const context = { user: owner };

  expect.assertions(4);

  const result = await request(query, { context, variables });
  
  expect(result.errors).toBeUndefined();
  expect(result.data.editCommunity).toBeDefined();
  expect(result.data.editCommunity.name).toBe(variables.input.name);
  expect(result.data.editCommunity.description).toBe(variables.input.description);
});

it('should prevent community from being edited by a non owner', async () => {
  const query = /* GraphQL */ `
    mutation editCommunity($input: EditCommunityInput!) {
      editCommunity (input: $input) {
        name
        description
      }
    },
  `;

  const context = { user: member };

  expect.assertions(3);

  const result = await request(query, { context, variables });
  
  expect(result.data.editCommunity).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/permission/i);
});

it('should prevent community from being edited by a non user', async () => {
  const query = /* GraphQL */ `
    mutation editCommunity($input: EditCommunityInput!) {
      editCommunity (input: $input) {
        name
        description
      }
    },
  `;

  expect.assertions(3);

  const result = await request(query, { variables });
  
  expect(result.data.editCommunity).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toBeDefined();
});
