// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { openModal } from 'src/actions/modals';
import { OutlineButton } from 'src/components/button';
import type { GetChannelType } from 'shared/graphql/queries/channel/getChannel';
import {
  SectionCard,
  SectionTitle,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import type { Dispatch } from 'redux';

type Props = {
  channel: GetChannelType,
  dispatch: Dispatch<Object>,
};

const Channel = (props: Props) => {
  const { channel, dispatch } = props;

  const initArchiveChannel = () => {
    const message = (
      <div>
        <p>
          Are you sure you want to archive this channel? Community members will
          no longer be able to post to this channel.
        </p>
      </div>
    );

    return dispatch(
      openModal('DELETE_DOUBLE_CHECK_MODAL', {
        id: channel.id,
        entity: 'channel-archive',
        message,
        buttonLabel: 'Archive',
      })
    );
  };

  const initRestoreChannel = () => {
    return dispatch(
      openModal('RESTORE_CHANNEL_MODAL', {
        channel: channel,
        id: channel.community.id,
      })
    );
  };

  if (!channel.isArchived) {
    return (
      <SectionCard>
        <SectionTitle>Archive channel</SectionTitle>
        {channel.isPrivate ? (
          <SectionSubtitle>
            Archiving a private channel will automatically remove the private
            channel item from your subscription. The channel will then become
            read-only and community members will no longer be able to start
            new conversations.
          </SectionSubtitle>
        ) : (
          <SectionSubtitle>
            Archiving a channel will make it read-only and community members
            will no longer be able to start new conversations.
          </SectionSubtitle>
        )}

        <SectionCardFooter>
          <OutlineButton onClick={initArchiveChannel}>
            Archive Channel
          </OutlineButton>
        </SectionCardFooter>
      </SectionCard>
    );
  } else {
    return (
      <SectionCard>
        <SectionTitle>Restore channel</SectionTitle>

        <SectionSubtitle>
          The channel will be restored and channel members will be able to
          start new conversations.
        </SectionSubtitle>

        <SectionCardFooter>
          <OutlineButton onClick={initRestoreChannel}>
            Restore Channel
          </OutlineButton>
        </SectionCardFooter>
      </SectionCard>
    );
  }
};

export default compose(connect())(Channel);
