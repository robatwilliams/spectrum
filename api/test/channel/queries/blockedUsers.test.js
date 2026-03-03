//@flow
import { request } from '../../utils';
import data from 'shared/testing/data';
import {
  SPECTRUM_GENERAL_CHANNEL_ID,
  CHANNEL_MODERATOR_USER_ID,
  COMMUNITY_MODERATOR_USER_ID,
  MAX_ID,
  BRYN_ID,
} from '../../../migrations/seed/default/constants';
const channelModerator = data.users.find(
  ({ id }) => id === CHANNEL_MODERATOR_USER_ID
);
const communityModerator = data.users.find(
  ({ id }) => id === COMMUNITY_MODERATOR_USER_ID
);
const communityOwner = data.users.find(({ id }) => id === MAX_ID);
const noPermissionUser = data.users.find(({ id }) => id === BRYN_ID);

it('should not fetch blocked users if not authed', async () => {
  const query = /* GraphQL */ `
    {
      channel(id: "${SPECTRUM_GENERAL_CHANNEL_ID}") {
        id
        blockedUsers {
          id
          name
          firstName
          description
          website
          username
          isOnline
          timezone
        }
      }
    }
  `;

  expect.assertions(2);
  const result = await request(query);

  expect(result.data.channel).toBeDefined();
  expect(result.data.channel.blockedUsers).toBeNull();
});

it('should not fetch blocked users if no permissions', async () => {
  const query = /* GraphQL */ `
    {
      channel(id: "${SPECTRUM_GENERAL_CHANNEL_ID}") {
        id
        blockedUsers {
          id
          name
          firstName
          description
          website
          username
          isOnline
          timezone
        }
      }
    }
  `;

  const context = { user: noPermissionUser };

  expect.assertions(2);
  const result = await request(query, { context });

  // User without permissions gets an error when trying to fetch blockedUsers
  expect(result.data.channel).toBeNull();
  expect(result.errors).toBeDefined();
});

it('should fetch blocked users if moderates channel', async () => {
  const query = /* GraphQL */ `
    {
      channel(id: "${SPECTRUM_GENERAL_CHANNEL_ID}") {
        id
        blockedUsers {
          id
          name
          firstName
          description
          website
          username
          isOnline
          timezone
        }
      }
    }
  `;

  const context = { user: channelModerator };

  expect.assertions(3);
  const result = await request(query, { context });

  expect(result.errors).toBeUndefined();
  expect(result.data.channel.id).toBe(SPECTRUM_GENERAL_CHANNEL_ID);
  expect(Array.isArray(result.data.channel.blockedUsers)).toBe(true);
});

it('should fetch blocked users if moderates community', async () => {
  const query = /* GraphQL */ `
    {
      channel(id: "${SPECTRUM_GENERAL_CHANNEL_ID}") {
        id
        blockedUsers {
          id
          name
          firstName
          description
          website
          username
          isOnline
          timezone
        }
      }
    }
  `;

  const context = { user: communityModerator };

  expect.assertions(3);
  const result = await request(query, { context });

  expect(result.errors).toBeUndefined();
  expect(result.data.channel.id).toBe(SPECTRUM_GENERAL_CHANNEL_ID);
  expect(Array.isArray(result.data.channel.blockedUsers)).toBe(true);
});

it('should fetch blocked users if owns community', async () => {
  const query = /* GraphQL */ `
    {
      channel(id: "${SPECTRUM_GENERAL_CHANNEL_ID}") {
        id
        blockedUsers {
          id
          name
          firstName
          description
          website
          username
          isOnline
          timezone
        }
      }
    }
  `;

  const context = { user: communityOwner };

  expect.assertions(3);
  const result = await request(query, { context });

  expect(result.errors).toBeUndefined();
  expect(result.data.channel.id).toBe(SPECTRUM_GENERAL_CHANNEL_ID);
  expect(Array.isArray(result.data.channel.blockedUsers)).toBe(true);
});
