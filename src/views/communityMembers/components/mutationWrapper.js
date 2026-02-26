// @flow
import * as React from 'react';
import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  const terminate = () => {
    return setIsLoading(false);
  };

  const mutate = () => {
    if (!mutation) return;
    return mutation(variables)
      .then(() => {
        dispatch(addToastWithTimeout('success', 'Saved permissions'));
        return terminate();
      })
      .catch(err => {
        dispatch(addToastWithTimeout('error', err.message));
        return terminate();
      });
  };

  const init = () => {
    if (!mutation) return;
    setIsLoading(true);
    return mutate();
  };

  return <div onClick={init}>{render({ isLoading })}</div>;
};

export default connect()(MutationWrapper);
