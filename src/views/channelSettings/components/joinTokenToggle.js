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
  const init = () => {
    return props.settings.tokenJoinEnabled ? disable() : enable();
  };

  const disable = () => {
    return props
      .disableChannelTokenJoin({ id: props.id })
      .then(() => {
        return props.dispatch(addToastWithTimeout('neutral', 'Link disabled'));
      })
      .catch(err => {
        return props.dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const enable = () => {
    return props
      .enableChannelTokenJoin({ id: props.id })
      .then(() => {
        return props.dispatch(addToastWithTimeout('success', 'Link enabled'));
      })
      .catch(err => {
        return props.dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const { tokenJoinEnabled } = props.settings;

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
