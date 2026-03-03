// @flow
import { request } from '../../utils';

it('should fetch a thread', async () => {
  const query = /* GraphQL */ `
    {
      thread(id: "thread-1") {
        id
        createdAt
        modifiedAt
        lastActive
        isPublished
        isLocked
        type
        content {
          title
        }
      }
    }
  `;

  expect.assertions(6);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.thread).toBeDefined();
  expect(result.data.thread.id).toBe('thread-1');
  expect(result.data.thread.isPublished).toBe(true);
  expect(result.data.thread.content.title).toBeDefined();
  expect(result.data.thread.type).toBeDefined();
});
