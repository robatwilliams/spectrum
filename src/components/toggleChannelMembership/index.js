// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { GetChannelType } from 'shared/graphql/queries/channel/getChannel';
import toggleChannelSubscriptionMutation from 'shared/graphql/mutations/channel/toggleChannelSubscription';
import type { ToggleChannelSubscriptionType } from 'shared/graphql/mutations/channel/toggleChannelSubscription';
import type { Dispatch } from 'redux';

type Props = {
  channel: {
    ...$Exact<GetChannelType>,
  },
  toggleSubscription: Function,
  dispatch: Dispatch<Object>,
  render: Function,
  onJoin?: Function,
  onLeave?: Function,
  toggleChannelSubscription: Function,
};

const ToggleChannelMembership = (props: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const toggleSubscription = () => {
    const { channel } = props;

    setIsLoading(true);

    props
      .toggleChannelSubscription({ channelId: channel.id })
      .then(({ data }: ToggleChannelSubscriptionType) => {
        setIsLoading(false);

        const { toggleChannelSubscription } = data;

        const isMember = toggleChannelSubscription.channelPermissions.isMember;
        const isPending =
          toggleChannelSubscription.channelPermissions.isPending;
        let str = '';
        if (isPending) {
          str = `Requested to join ${toggleChannelSubscription.name} in ${
            toggleChannelSubscription.community.name
          }`;
        }

        if (!isPending && isMember) {
          str = `Joined ${toggleChannelSubscription.name} in ${
            toggleChannelSubscription.community.name
          }!`;
        }

        if (!isPending && !isMember) {
          str = `Left the channel ${toggleChannelSubscription.name} in ${
            toggleChannelSubscription.community.name
          }.`;
        }

        const type = isMember || isPending ? 'success' : 'neutral';
        props.dispatch(addToastWithTimeout(type, str));
        return;
      })
      .catch(err => {
        setIsLoading(false);
        props.dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const init = () => {
    setIsLoading(true);

    return toggleSubscription();
  };

  const terminate = () => {
    setIsLoading(false);
  };

  return <div onClick={init}>{props.render({ isLoading })}</div>;
};

export default compose(
  connect(),
  toggleChannelSubscriptionMutation
)(ToggleChannelMembership);
