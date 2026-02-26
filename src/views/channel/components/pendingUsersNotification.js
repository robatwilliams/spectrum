// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import compose from 'recompose/compose';
import { displayLoadingCard } from 'src/components/loading';
import getPendingUsersQuery from 'shared/graphql/queries/channel/getChannelPendingUsers';
import type { GetChannelPendingUsersType } from 'shared/graphql/queries/channel/getChannelPendingUsers';
import { PendingUserNotificationContainer, PendingUserCount } from './style';

type Props = {
  data: {
    channel: GetChannelPendingUsersType,
  },
};

const PendingUsersNotificationPure = (props: Props) => {
  const { channel } = props.data;

  if (!channel || !channel.pendingUsers || channel.pendingUsers.length === 0)
    return null;

  return (
    <PendingUserNotificationContainer>
      <Link to={`/${channel.community.slug}/${channel.slug}/settings`}>
        <PendingUserCount>{channel.pendingUsers.length}</PendingUserCount>
        Pending members
      </Link>
    </PendingUserNotificationContainer>
  );
};

export const PendingUsersNotification = compose(
  getPendingUsersQuery,
  displayLoadingCard
)(PendingUsersNotificationPure);

export default PendingUsersNotification;
