// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { GetChannelType } from 'shared/graphql/queries/channel/getChannel';
import toggleChannelNotificationsMutation, {
  type ToggleChannelNotificationsType,
} from 'shared/graphql/mutations/channel/toggleChannelNotifications';
import type { Dispatch } from 'redux';

type Props = {
  channel: {
    ...$Exact<GetChannelType>,
  },
  toggleChannelNotifications: Function,
  dispatch: Dispatch<Object>,
  render: Function,
};

const ToggleChannelNotifications = (props: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const init = e => {
    e && e.preventDefault() && e.stopPropogation();

    setIsLoading(true);

    return toggleNotifications();
  };

  const terminate = () => {
    setIsLoading(false);
  };

  const toggleNotifications = () => {
    const { channel } = props;

    setIsLoading(true);

    props
      .toggleChannelNotifications(channel.id)
      .then(({ data }: ToggleChannelNotificationsType) => {
        setIsLoading(false);

        const { toggleChannelNotifications } = data;

        const value =
          toggleChannelNotifications.channelPermissions.receiveNotifications;
        const type = value ? 'success' : 'neutral';
        const str = value
          ? 'Channel notifications enabled!'
          : 'Channel notifications disabled.';
        props.dispatch(addToastWithTimeout(type, str));
        return;
      })
      .catch(err => {
        setIsLoading(false);
        props.dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const { channel } = props;
  const { channelPermissions } = channel;
  const { receiveNotifications } = channelPermissions;

  return (
    <div
      data-cy={
        receiveNotifications
          ? 'channel-notifications-enabled'
          : 'channel-notifications-muted'
      }
      onClick={init}
    >
      {props.render({ isLoading })}
    </div>
  );
};

export default compose(
  connect(),
  toggleChannelNotificationsMutation
)(ToggleChannelNotifications);
