// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import resetJoinTokenMutation from 'shared/graphql/mutations/community/resetCommunityJoinToken';
import { addToastWithTimeout } from 'src/actions/toasts';
import { OutlineButton } from 'src/components/button';

type Props = {
  id: string,
  settings: {
    tokenJoinEnabled: boolean,
  },
  resetCommunityJoinToken: Function,
  dispatch: Function,
};

const ResetJoinToken = (props: Props) => {
  const { id, resetCommunityJoinToken, dispatch } = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const reset = () => {
    setIsLoading(true);
    return resetCommunityJoinToken({ id })
      .then(() => {
        setIsLoading(false);
        return dispatch(addToastWithTimeout('success', 'Link reset!'));
      })
      .catch(err => {
        setIsLoading(false);
        return dispatch(addToastWithTimeout('error', err.message));
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
        {isLoading ? 'Resetting...' : 'Reset this link'}
      </OutlineButton>
    </div>
  );
};

export default compose(
  connect(),
  resetJoinTokenMutation
)(ResetJoinToken);
