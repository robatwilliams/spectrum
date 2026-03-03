//@flow
import { request } from '../../utils';
import db from 'shared/testing/db';
import data from 'shared/testing/data';
import { SPECTRUM_GENERAL_CHANNEL_ID, SPECTRUM_COMMUNITY_ID } from '../../../migrations/seed/default/constants';

// various permissions for Spectrum community
const member = data.users.find(({ username }) => username === 'mxstbr');
const noPermissionUser = data.users.find(
  ({ username }) => username === 'quiet-user'
);

afterEach(async () => {
  await db
    .table('threads')
    .filter({ content: { title: 'test thread' } })
    .delete()
    .run();
});

const variables = {
  thread: {
    channelId: SPECTRUM_GENERAL_CHANNEL_ID,
    communityId: SPECTRUM_COMMUNITY_ID,
    type: 'DRAFTJS',
    content: {
      title: 'test thread',
      body: '',
    },
  },
};

it('should create a thread if user has permissions', async () => {
  const query = /* GraphQL */ `
    mutation publishThread($thread: ThreadInput!) {
      publishThread (thread: $thread) {
        isPublished
        isLocked
        type
        content {
          title
        }
      }
    },
  `;

  const context = {
    user: member,
  };

  expect.assertions(5);

  const result = await request(query, { context, variables });
  
  expect(result.errors).toBeUndefined();
  expect(result.data.publishThread.isPublished).toBe(true);
  expect(result.data.publishThread.isLocked).toBe(false);
  expect(result.data.publishThread.type).toBe('DRAFTJS');
  expect(result.data.publishThread.content.title).toBe('test thread');
});

it('should prevent thread publish if user has no permissions', async () => {
  const query = /* GraphQL */ `
    mutation publishThread($thread: ThreadInput!) {
      publishThread (thread: $thread) {
        isPublished
        isLocked
        type
        content {
          title
        }
      }
    },
  `;

  const context = {
    user: noPermissionUser,
  };

  expect.assertions(3);
  const result = await request(query, { context, variables });

  expect(result.data.publishThread).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/permission|member/i);
});

it('should prevent signed out users from publishing a thread', async () => {
  const query = /* GraphQL */ `
    mutation publishThread($thread: ThreadInput!) {
      publishThread (thread: $thread) {
        isPublished
        isLocked
        type
        content {
          title
        }
      }
    },
  `;

  expect.assertions(3);
  const result = await request(query, { variables });

  expect(result.data.publishThread).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/signed in/i);
});
