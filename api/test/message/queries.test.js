// @flow
import { request } from '../utils';
import data from 'shared/testing/data';

it('should fetch a message', async () => {
  const query = /* GraphQL */ `
    {
      message(id: "${data.messages[0].id}") {
        id
        timestamp
        content {
          body
        }
        messageType
      }
    }
  `;

  expect.assertions(5);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.message).toBeDefined();
  expect(result.data.message.id).toBe(data.messages[0].id);
  expect(result.data.message.content.body).toBeDefined();
  expect(result.data.message.messageType).toBeDefined();
});

describe('sender', () => {
  it('should fetch a user', async () => {
    const query = /* GraphQL */ `
      {
        message(id: "${data.messages[0].id}") {
          author {
            id
            user { 
              username
            }
          }
        }
      }
    `;

    expect.assertions(4);
    const result = await request(query);

    expect(result.errors).toBeUndefined();
    expect(result.data.message.author).toBeDefined();
    expect(result.data.message.author.id).toBeDefined();
    expect(result.data.message.author.user.username).toBeDefined();
  });
});
