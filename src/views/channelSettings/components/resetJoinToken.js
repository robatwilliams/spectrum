// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import resetJoinTokenMutation from 'shared/graphql/mutations/channel/resetChannelJoinToken';
import { addToastWithTimeout } from 'src/actions/toasts';
import { OutlineButton } from 'src/components/button';
import type { Dispatch } from 'redux';

type Props = {
  id: string,
  settings: {
    tokenJoinEnabled: boolean,
  },
  resetChannelJoinToken: Function,
  dispatch: Dispatch<Object>,
};

const ResetJoinToken = (props: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const reset = () => {
    setIsLoading(true);
    return props
      .resetChannelJoinToken({ id: props.id })
      .then(() => {
        setIsLoading(false);
        return props.dispatch(
          addToastWithTimeout('success', 'Link reset!')
        );
      })
      .catch(err => {
        setIsLoading(false);
        return props.dispatch(addToastWithTimeout('error', err.message));
      });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '16px',
      }}
    >
      <OutlineButton
        loading={isLoading}
        onClick={reset}
        data-cy="refresh-join-link-token"
      >
        {isLoading ? 'Resetting' : 'Reset this link'}
      </OutlineButton>
    </div>
  );
};

export default compose(
  connect(),
  resetJoinTokenMutation
)(ResetJoinToken);
