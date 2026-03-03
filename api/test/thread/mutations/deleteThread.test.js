//@flow
import { request } from '../../utils';
import db from 'shared/testing/db';
import data from 'shared/testing/data';

const defaultThread = data.threads[0];
const owner = data.users.find(({ username }) => username === 'mxstbr');
const member = data.users.find(({ username }) => username === 'brian');
const noPermissionUser = data.users.find(
  ({ username }) => username === 'quiet-user'
);

// before each test, make sure the thread exists to test deletion
beforeEach(async () => {
  const threadExists = await db
    .table('threads')
    .get(defaultThread.id)
    .run();

  if (threadExists.deletedAt) {
    await db
      .table('threads')
      .get(defaultThread.id)
      .update({
        deletedAt: db.literal(),
      })
      .run();
  }
});

const variables = {
  threadId: defaultThread.id,
};

it('should be able to delete self-published thread', async () => {
  const query = /* GraphQL */ `
    mutation deleteThread($threadId: ID!) {
      deleteThread (threadId: $threadId)
    },
  `;

  const context = {
    user: member,
  };

  expect.assertions(3);

  const result = await request(query, { context, variables });
  
  expect(result.errors).toBeUndefined();
  expect(result.data.deleteThread).toBe(true);
  
  // Verify thread is marked as deleted
  const deletedThread = await db.table('threads').get(defaultThread.id).run();
  expect(deletedThread.deletedAt).toBeDefined();
});

it('should be able to delete thread if user owns community', async () => {
  const query = /* GraphQL */ `
    mutation deleteThread($threadId: ID!) {
      deleteThread (threadId: $threadId)
    },
  `;

  const context = {
    user: owner,
  };

  expect.assertions(3);

  const result = await request(query, { context, variables });
  
  expect(result.errors).toBeUndefined();
  expect(result.data.deleteThread).toBe(true);
  
  // Verify thread is marked as deleted
  const deletedThread = await db.table('threads').get(defaultThread.id).run();
  expect(deletedThread.deletedAt).toBeDefined();
});

it("should not delete thread if user doesn't have permissions", async () => {
  const query = /* GraphQL */ `
    mutation deleteThread($threadId: ID!) {
      deleteThread (threadId: $threadId)
    },
  `;

  const context = {
    user: noPermissionUser,
  };

  expect.assertions(3);

  const result = await request(query, { context, variables });
  
  expect(result.data.deleteThread).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toMatch(/permission/i);
});

it('should not delete thread if user is not signed in', async () => {
  const query = /* GraphQL */ `
    mutation deleteThread($threadId: ID!) {
      deleteThread (threadId: $threadId)
    },
  `;

  const context = {
    user: null,
  };

  expect.assertions(3);

  const result = await request(query, { context, variables });
  
  expect(result.data.deleteThread).toBeNull();
  expect(result.errors).toBeDefined();
  expect(result.errors[0].message).toBeDefined();
});
});
