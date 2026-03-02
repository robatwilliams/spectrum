// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import getCommunityMemberQuery from 'shared/graphql/queries/communityMember/getCommunityMember';

type Props = {
  userId: string,
  communityId: string,
  render: Function,
  data: Object,
};

const GetCommunityMember = ({ data, render }: Props) => {
  if (!data.communityMember) {
    return render({ communityMember: null });
  }

  return render({
    communityMember: data.communityMember,
  });
};

export default compose(getCommunityMemberQuery)(GetCommunityMember);
