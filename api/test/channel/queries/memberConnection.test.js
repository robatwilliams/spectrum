//@flow
import { request } from '../../utils';
import { SPECTRUM_GENERAL_CHANNEL_ID } from '../../../migrations/seed/default/constants';

it('should fetch a channels member connection', async () => {
  const query = /* GraphQL */ `
    {
      channel(id: "${SPECTRUM_GENERAL_CHANNEL_ID}") {
        id
        memberConnection(after: null) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              id
              name
              contextPermissions {
                communityId
                reputation
              }
            }
          }
        }
      }
    }
  `;

  expect.assertions(5);
  const result = await request(query);

  expect(result.errors).toBeUndefined();
  expect(result.data.channel.id).toBe(SPECTRUM_GENERAL_CHANNEL_ID);
  expect(result.data.channel.memberConnection).toBeDefined();
  expect(result.data.channel.memberConnection.pageInfo).toBeDefined();
  expect(Array.isArray(result.data.channel.memberConnection.edges)).toBe(true);
});
