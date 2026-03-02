// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { Dispatch } from 'redux';

type Props = {
  mutation: ?Function,
  variables: any,
  dispatch: Dispatch<Object>,
  render: Function,
};

const MutationWrapper = (props: Props) => {
  const { mutation, variables, dispatch, render } = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const mutate = React.useCallback(() => {
    if (!mutation) return;
    return mutation(variables)
      .then(() => {
        dispatch(addToastWithTimeout('success', 'Saved permissions'));
        setIsLoading(false);
      })
      .catch(err => {
        dispatch(addToastWithTimeout('error', err.message));
        setIsLoading(false);
      });
  }, [mutation, variables, dispatch]);

  const init = () => {
    if (!mutation) return;
    setIsLoading(true);
    return mutate();
  };

  return <div onClick={init}>{render({ isLoading })}</div>;
};

export default connect()(MutationWrapper);
