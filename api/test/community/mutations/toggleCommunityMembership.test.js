//@flow
import { request } from '../../utils';
import db from 'shared/testing/db';
import data from 'shared/testing/data';

// various permissions for Spectrum community
const community = data.communities[0];
const owner = data.users.find(({ username }) => username === 'mxstbr');
const member = data.users.find(({ username }) => username === 'bryn');
const nonMember = data.users.find(({ username }) => username === 'quiet-user');
const blockedMember = data.users.find(
  ({ username }) => username === 'blocked-user'
);

const variables = {
  communityId: community.id,
};

const cleanTables = () =>
  Promise.all([
    db
      .table('usersCommunities')
      .delete()
      .run(),
    db
      .table('usersChannels')
      .delete()
      .run(),
  ]);

const populateTables = () =>
  Promise.all([
    db
      .table('usersCommunities')
      .insert(data.usersCommunities)
      .run(),
    db
      .table('usersChannels')
      .insert(data.usersChannels)
      .run(),
  ]);

// after each test just reset the database
beforeEach(async () => {
  await cleanTables();
  await populateTables();
});

afterAll(async () => {
  await cleanTables();
  await populateTables();
});

const getUsersChannels = (userId: string) =>
  db
    .table('usersChannels')
    .filter({ userId })
    .run();

const getUsersCommunities = (userId: string, communityId: string) =>
  db
    .table('usersCommunities')
    .getAll([userId, communityId], {
      index: 'userIdAndCommunityId',
    })
    .run();

it('should join a community', async () => {
  const query = /* GraphQL */ `
    mutation toggleCommunityMembership($communityId: ID!) {
      toggleCommunityMembership(communityId: $communityId) {
        id
        communityPermissions {
          isMember
          isBlocked
          isOwner
          reputation
        }
      }
    }
  `;

  const context = {
    user: nonMember,
  };

  expect.assertions(5);
  const result = await request(query, { context, variables });

  expect(result.errors).toBeUndefined();
  expect(result.data.toggleCommunityMembership.id).toBe(community.id);
  expect(
    result.data.toggleCommunityMembership.communityPermissions.isMember
  ).toBe(true);
  expect(
    result.data.toggleCommunityMembership.communityPermissions.isBlocked
  ).toBe(false);
  expect(
    result.data.toggleCommunityMembership.communityPermissions.isOwner
  ).toBe(false);
});

it('should leave a community', async () => {
  const query = /* GraphQL */ `
    mutation toggleCommunityMembership($communityId: ID!) {
      toggleCommunityMembership(communityId: $communityId) {
        id
        communityPermissions {
          isMember
          isBlocked
          isOwner
          reputation
        }
      }
    }
  `;

  const context = {
    user: member,
  };

  expect.assertions(4);
  const result = await request(query, { context, variables });

  expect(result.errors).toBeUndefined();
  expect(result.data.toggleCommunityMembership.id).toBe(community.id);
  expect(
    result.data.toggleCommunityMembership.communityPermissions.isMember
  ).toBe(false);

  // Verify in database that user is no longer a member
  const usersCommunities = await getUsersCommunities(member.id, community.id);
  expect(usersCommunities[0].isMember).toBe(false);
});

it('should join all default channels when joining a community', async () => {
  const query = /* GraphQL */ `
    mutation toggleCommunityMembership($communityId: ID!) {
      toggleCommunityMembership(communityId: $communityId) {
        id
        communityPermissions {
          isMember
          isBlocked
          isOwner
          reputation
        }
      }
    }
  `;

  const context = {
    user: nonMember,
  };

  expect.assertions(4);
  const result = await request(query, { context, variables });

  expect(result.errors).toBeUndefined();
  expect(
    result.data.toggleCommunityMembership.communityPermissions.isMember
  ).toBe(true);

  // Verify user was added to default channels
  const usersChannels = await getUsersChannels(nonMember.id);
  expect(usersChannels.length).toBeGreaterThan(0);
  const allMember = usersChannels.every(c => c.isMember);
  expect(allMember).toBe(true);
});

it('should leave all channels when leaving a community', async () => {
  const query = /* GraphQL */ `
    mutation toggleCommunityMembership($communityId: ID!) {
      toggleCommunityMembership(communityId: $communityId) {
        id
        communityPermissions {
          isMember
          isBlocked
          isOwner
          reputation
        }
      }
    }
  `;

  const context = {
    user: member,
  };

  // Get channels in this community before leaving
  const channelsInCommunityBefore = await db
    .table('channels')
    .filter({ communityId: community.id })
    .run();
  const channelIdsInCommunity = channelsInCommunityBefore.map(c => c.id);

  expect.assertions(5);
  const result = await request(query, { context, variables });

  expect(result.errors).toBeUndefined();
  expect(
    result.data.toggleCommunityMembership.communityPermissions.isMember
  ).toBe(false);

  // Verify user was removed from all channels in this community
  const usersChannels = await getUsersChannels(member.id);
  expect(usersChannels.length).toBeGreaterThan(0);
  const channelsInCommunity = usersChannels.filter(uc =>
    channelIdsInCommunity.includes(uc.channelId)
  );
  expect(channelsInCommunity.length).toBeGreaterThan(0);
  const allNotMember = channelsInCommunity.every(c => !c.isMember);
  expect(allNotMember).toBe(true);
});

it('should prevent a blocked user from joining a community', async () => {
  const query = /* GraphQL */ `
    mutation toggleCommunityMembership($communityId: ID!) {
      toggleCommunityMembership(communityId: $communityId) {
        id
        communityPermissions {
          isMember
          isBlocked
          isOwner
          reputation
        }
      }
    }
  `;

  const context = {
    user: blockedMember,
  };

  expect.assertions(3);
  const result = await request(query, { context, variables });

  expect(result.data.toggleCommunityMembership).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/permission/i);
});

it('should prevent community owner from leaving community', async () => {
  const query = /* GraphQL */ `
    mutation toggleCommunityMembership($communityId: ID!) {
      toggleCommunityMembership(communityId: $communityId) {
        id
        communityPermissions {
          isMember
          isBlocked
          isOwner
          reputation
        }
      }
    }
  `;

  const context = {
    user: owner,
  };

  expect.assertions(3);
  const result = await request(query, { context, variables });

  expect(result.data.toggleCommunityMembership).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/owner.*can't.*join or leave/i);
});

it('should only have one usersCommunities record after joining a community', async () => {
  const query = /* GraphQL */ `
    mutation toggleCommunityMembership($communityId: ID!) {
      toggleCommunityMembership(communityId: $communityId) {
        id
        communityPermissions {
          isMember
          isBlocked
          isOwner
          reputation
        }
      }
    }
  `;

  const context = {
    user: nonMember,
  };

  expect.assertions(4);
  const result = await request(query, { context, variables });

  expect(result.errors).toBeUndefined();
  expect(
    result.data.toggleCommunityMembership.communityPermissions.isMember
  ).toBe(true);

  // Verify exactly one usersCommunities record exists
  const usersCommunities = await getUsersCommunities(
    nonMember.id,
    community.id
  );
  expect(usersCommunities).toHaveLength(1);
  expect(usersCommunities[0].isMember).toBe(true);
});

it('should only have one usersCommunities record after leaving a community', async () => {
  const query = /* GraphQL */ `
    mutation toggleCommunityMembership($communityId: ID!) {
      toggleCommunityMembership(communityId: $communityId) {
        id
        communityPermissions {
          isMember
          isBlocked
          isOwner
          reputation
        }
      }
    }
  `;

  const context = {
    user: member,
  };

  expect.assertions(4);
  const result = await request(query, { context, variables });

  expect(result.errors).toBeUndefined();
  expect(
    result.data.toggleCommunityMembership.communityPermissions.isMember
  ).toBe(false);

  // Verify exactly one usersCommunities record exists
  const usersCommunities = await getUsersCommunities(member.id, community.id);
  expect(usersCommunities).toHaveLength(1);
  expect(usersCommunities[0].isMember).toBe(false);
});
