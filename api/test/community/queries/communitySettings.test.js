//@flow
import { request } from '../../utils';
import { SPECTRUM_COMMUNITY_ID } from '../../../migrations/seed/default/constants';

it('should fetch a communitys settings', async () => {
  const query = /* GraphQL */ `
    {
      community(id: "${SPECTRUM_COMMUNITY_ID}") {
        id
        brandedLogin {
          isEnabled
          message
        }
      }
    }
  `;

  expect.assertions(3);
  const result = await request(query);

  const { data: { community } } = result;

  expect(result.errors).toBeUndefined();
  expect(community.brandedLogin).toBeDefined();
  expect(community.brandedLogin.isEnabled).toEqual(false);
});
