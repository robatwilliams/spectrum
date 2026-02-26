// @flow
import * as React from 'react';
import { Checkbox } from 'src/components/formElements';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import enableTokenJoinMutation from 'shared/graphql/mutations/channel/enableChannelTokenJoin';
import disableTokenJoinMutation from 'shared/graphql/mutations/channel/disableChannelTokenJoin';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { Dispatch } from 'redux';

type Props = {
  id: string,
  settings: {
    tokenJoinEnabled: boolean,
  },
  enableChannelTokenJoin: Function,
  disableChannelTokenJoin: Function,
  dispatch: Dispatch<Object>,
};

const TokenJoinToggle = (props: Props) => {
  const { id, settings, enableChannelTokenJoin, disableChannelTokenJoin, dispatch } = props;

  const disable = () => {
    return disableChannelTokenJoin({ id })
      .then(() => {
        return dispatch(
          addToastWithTimeout('neutral', 'Link disabled')
        );
      })
      .catch(err => {
        return dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const enable = () => {
    return enableChannelTokenJoin({ id })
      .then(() => {
        return dispatch(
          addToastWithTimeout('success', 'Link enabled')
        );
      })
      .catch(err => {
        return dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const init = () => {
    return settings.tokenJoinEnabled
      ? disable()
      : enable();
  };

  const { tokenJoinEnabled } = settings;

  return (
    <Checkbox
      checked={tokenJoinEnabled}
      onChange={init}
      dataCy="toggle-token-link-invites"
    >
      Enable users to join via link
    </Checkbox>
  );
};

export default compose(
  connect(),
  enableTokenJoinMutation,
  disableTokenJoinMutation
)(TokenJoinToggle);
