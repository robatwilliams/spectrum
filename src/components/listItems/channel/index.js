// @flow
import * as React from 'react';
import {
  ChannelContainer,
  ChannelNameLink,
  ChannelName,
  ChannelActions,
} from './style';
import type { ChannelInfoType } from 'shared/graphql/fragments/channel/channelInfo';

type Props = {
  children: React$Node,
  channel: ChannelInfoType,
};

const ChannelListItem = (props: Props) => {
  const { channel, children } = props;

  return (
    <ChannelContainer>
      <ChannelNameLink to={`/${channel.community.slug}/${channel.slug}`}>
        <ChannelName>{channel.name}</ChannelName>
      </ChannelNameLink>

      {children && <ChannelActions>{children}</ChannelActions>}
    </ChannelContainer>
  );
}

export default ChannelListItem;
