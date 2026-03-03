//@flow
import { request } from '../../utils';
import { SPECTRUM_GENERAL_CHANNEL_ID } from '../../../migrations/seed/default/constants';

it('should fetch a channel by id', async () => {
  const query = /* GraphQL */ `
    {
      channel(id: "${SPECTRUM_GENERAL_CHANNEL_ID}") {
        id
        name
        slug
        description
        isPrivate
        createdAt
      }
    }
  `;

  expect.assertions(5);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.channel).toBeDefined();
  expect(result.data.channel.id).toBe(SPECTRUM_GENERAL_CHANNEL_ID);
  expect(result.data.channel.slug).toBe('general');
  expect(result.data.channel.name).toBeDefined();
});

it('should fetch a channel by slug and community slug', async () => {
  const query = /* GraphQL */ `
    {
      channel(channelSlug: "general", communitySlug: "spectrum") {
        id
        name
        slug
        description
        isPrivate
        createdAt
      }
    }
  `;

  expect.assertions(5);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.channel).toBeDefined();
  expect(result.data.channel.id).toBe(SPECTRUM_GENERAL_CHANNEL_ID);
  expect(result.data.channel.slug).toBe('general');
  expect(result.data.channel.name).toBeDefined();
});
