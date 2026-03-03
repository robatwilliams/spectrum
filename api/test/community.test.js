// @flow
import { request } from './utils';
import { SPECTRUM_COMMUNITY_ID } from '../migrations/seed/default/constants';

it('should fetch a community', async () => {
  const query = /* GraphQL */ `
    {
      community(id: "${SPECTRUM_COMMUNITY_ID}") {
        id
        createdAt
        name
        slug
        description
        website
      }
    }
  `;

  expect.assertions(4);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.community).toBeDefined();
  expect(result.data.community.id).toBe(SPECTRUM_COMMUNITY_ID);
  expect(result.data.community.slug).toBe('spectrum');
});

it('should fetch a communities threads', async () => {
  const query = /* GraphQL */ `
    {
      community(id: "${SPECTRUM_COMMUNITY_ID}") {
        threadConnection {
          edges {
            node {
              content {
                title
              }
            }
          }
        }
      }
    }
  `;

  expect.assertions(3);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.community).toBeDefined();
  expect(result.data.community.threadConnection.edges.length).toBeGreaterThan(0);
});

it('should fetch a list of communities', async () => {
  const query = /* GraphQL */ `
    {
      communities(slugs: ["spectrum"]) {
        id
        createdAt
        slug
        description
        website
      }
    }
  `;

  expect.assertions(4);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.communities).toBeDefined();
  expect(result.data.communities.length).toBeGreaterThan(0);
  expect(result.data.communities[0].slug).toBe('spectrum');
});

it('should fetch a list of community members', async () => {
  const query = /* GraphQL */ `
    {
      community(id: "${SPECTRUM_COMMUNITY_ID}") {
        id
        members {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              user {
                id
              }
              reputation
              isOwner
              isModerator
              isMember
              isBlocked
            }
          }
        }
      }
    }
  `;

  expect.assertions(5);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.community).toBeDefined();
  expect(result.data.community.members).toBeDefined();
  expect(result.data.community.members.edges.length).toBeGreaterThan(0);
  expect(result.data.community.members.pageInfo).toBeDefined();
});
